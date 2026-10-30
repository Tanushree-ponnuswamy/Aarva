"""
Deep (whole-document) summarisation for AARVA.

Reads EVERY page of an uploaded document, not just the first few:
  1. The document is split into chapters/sections (from the PDF outline or detected headings).
  2. Each chapter is cut into units that fit the model's context window, and every unit is summarised
     by the LLM (map step), so all pages are read.
  3. Unit summaries are merged into one summary per chapter.
  4. One final call turns the chapter summaries into the overview, key points, concepts, definitions
     and notes (reduce step).

Progress is written to the book's `summary_data` after each unit so the app can show
"Reading section 12/60" and display chapter summaries as soon as they are ready.
When the LLM is unreachable the same pipeline runs with an extractive (sentence-ranking) summariser,
so a summary always exists and is always based on the document text.
"""

import os
import re
import time
from collections import Counter
from typing import Any, Callable, Dict, List, Optional, Tuple

import requests

from config import settings

UNIT_CHARS = int(os.getenv("DEEP_SUMMARY_UNIT_CHARS", "9000"))
MAX_MINUTES = int(os.getenv("DEEP_SUMMARY_MAX_MINUTES", "180"))
UNIT_TIMEOUT = int(os.getenv("DEEP_SUMMARY_UNIT_TIMEOUT", "600"))
FINAL_TIMEOUT = int(os.getenv("DEEP_SUMMARY_FINAL_TIMEOUT", "900"))
NUM_CTX = int(os.getenv("LLM_NUM_CTX", "8192"))

_STOP = set(
    "the a an and or but if then of to in on at for with by from as is are was were be been being it this that these those "
    "he she they we you i his her their our your its not no yes can could should would will may might do does did has have had "
    "which who whom whose what when where why how also than so such into over under about between after before during".split()
)
_BOILERPLATE = (
    "government of", "free textbook programme", "department of school education", "not for sale", "first edition",
    "revised edition", "reprint", "published by", "printed by", "all rights reserved", "isbn", ".indd", "typeset",
    "www.", "http",
)


# ───────────────────────── LLM helpers ─────────────────────────

def ollama_up() -> bool:
    try:
        return requests.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags", timeout=3).status_code == 200
    except Exception:
        return False


def llm_text(prompt: str, system: str, model: str, num_predict: int = 350, timeout: int = UNIT_TIMEOUT,
             json_mode: bool = False) -> str:
    """One non-streaming chat call. Raises on any failure so the caller can fall back."""
    body: Dict[str, Any] = {
        "model": model,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        "stream": False,
        "think": False,
        "options": {"temperature": 0.2, "top_p": 0.9, "num_predict": num_predict, "num_ctx": NUM_CTX},
    }
    if json_mode:
        body["format"] = "json"
    res = requests.post(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat", json=body, timeout=timeout)
    res.raise_for_status()
    text = res.json().get("message", {}).get("content", "").strip()
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    if not text:
        raise RuntimeError("empty model response")
    return text


# ───────────────────────── text helpers ─────────────────────────

def _sentences(text: str) -> List[str]:
    flat = re.sub(r"\s+", " ", text)
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"'(])", flat)
    return [p.strip() for p in parts if 30 <= len(p.strip()) <= 400 and not any(b in p.lower() for b in _BOILERPLATE)]


def extractive_summary(text: str, n: int = 5) -> str:
    """Pick the n most informative sentences (word-frequency scoring), kept in original order."""
    sents = _sentences(text)
    if not sents:
        return re.sub(r"\s+", " ", text).strip()[:400]
    words = [w for w in re.findall(r"[a-z']{3,}", text.lower()) if w not in _STOP]
    freq = Counter(words)
    if not freq:
        return " ".join(sents[:n])
    top = max(freq.values())
    scored = []
    for i, s in enumerate(sents):
        toks = [w for w in re.findall(r"[a-z']{3,}", s.lower()) if w not in _STOP]
        if not toks:
            continue
        score = sum(freq[w] / top for w in toks) / (len(toks) ** 0.6)
        score *= 1.15 if i < 3 else 1.0
        scored.append((score, i))
    keep = sorted(i for _, i in sorted(scored, reverse=True)[:n])
    return " ".join(sents[i] for i in keep)


def split_units(text: str, max_chars: int = UNIT_CHARS) -> List[str]:
    """Cut text into pieces of at most max_chars on paragraph/sentence boundaries, losing nothing."""
    text = text.strip()
    if len(text) <= max_chars:
        return [text] if text else []
    units: List[str] = []
    current = ""
    for para in re.split(r"\n\s*\n", text):
        para = para.strip()
        if not para:
            continue
        while len(para) > max_chars:  # a single huge paragraph: cut at a sentence end
            cut = para.rfind(". ", 0, max_chars)
            cut = cut + 1 if cut > max_chars // 2 else max_chars
            piece, para = para[:cut], para[cut:].lstrip()
            if current:
                units.append(current)
                current = ""
            units.append(piece)
        if len(current) + len(para) + 2 > max_chars:
            if current:
                units.append(current)
            current = para
        else:
            current = f"{current}\n\n{para}" if current else para
    if current:
        units.append(current)
    return units


def _split_terms(raw: str) -> Tuple[str, List[str]]:
    m = re.search(r"key terms?\s*[:\-]", raw, flags=re.IGNORECASE)
    if not m:
        return raw.strip(), []
    body, terms = raw[:m.start()].strip(), raw[m.end():]
    items = [t.strip(" .*-•\n") for t in re.split(r"[,;\n]", terms) if t.strip(" .*-•\n")]
    return body, items[:6]


# ───────────────────────── main entry ─────────────────────────

def run_deep_summary(
    book_id: int,
    pages: List[Any],
    sections: List[Dict[str, Any]],
    title: str,
    filename: str,
    db,
    should_cancel: Optional[Callable[[], bool]] = None,
) -> None:
    """Summarise every page of the document and store the result on the Textbook row."""
    from models.models import Textbook
    from services.llama_service import llama_service

    def row():
        db.rollback()
        return db.get(Textbook, book_id)

    def save(mutator) -> bool:
        r = row()
        if r is None:
            return False  # the user deleted the book
        data = dict(r.summary_data or {})
        mutator(data)
        r.summary_data = data
        db.commit()
        return True

    if not sections:
        sections = [{"chapter": 1, "page": 1, "page_end": len(pages), "title": title}]

    # Build the work list: every page belongs to exactly one chapter, every chapter to >= 1 unit.
    work: List[Tuple[int, str]] = []
    chapters: List[Dict[str, Any]] = []
    for idx, sec in enumerate(sections):
        a, b = int(sec.get("page", 1)), int(sec.get("page_end", sec.get("page", 1)))
        body = "\n\n".join((pages[p - 1].text or "") for p in range(a, min(b, len(pages)) + 1) if 1 <= p <= len(pages))
        units = split_units(body)
        chapters.append({"chapter": idx + 1, "title": sec.get("title") or f"Section {idx + 1}", "page": a, "page_end": b,
                         "summary": "", "key_terms": [], "_units": len(units)})
        for u in units:
            work.append((idx, u))
    total = len(work)

    use_llm = ollama_up()
    model = llama_service._get_best_model() if use_llm else ""
    started = time.time()
    failures = 0
    unit_results: Dict[int, List[str]] = {i: [] for i in range(len(chapters))}
    done = 0

    def publish(state: str, extra: Optional[Dict[str, Any]] = None) -> bool:
        view = [{k: v for k, v in c.items() if not k.startswith("_")} for c in chapters]

        def mut(d):
            d["summary_state"] = state
            d["summary_progress"] = {"done": done, "total": total}
            d["summary_engine"] = "llm" if use_llm else "extractive"
            d["chapters"] = view
            if extra:
                d.update(extra)
        return save(mut)

    if not publish("running"):
        return

    for idx, unit in work:
        if should_cancel and should_cancel():
            return
        ch = chapters[idx]
        text_summary, terms = "", []
        if use_llm and (time.time() - started) < MAX_MINUTES * 60:
            try:
                raw = llm_text(
                    f"Summarize this part of the book \"{title}\" (chapter: {ch['title']}, pages {ch['page']}-{ch['page_end']}) "
                    "in 4-6 sentences for a student. Cover the main ideas, important terms, key facts and examples. "
                    "Use ONLY the text below; do not add outside knowledge. Then on a new line write 'Key terms:' "
                    "followed by up to 6 important terms from the text, comma-separated.\n\nTEXT:\n" + unit,
                    system="You are a careful study assistant who summarises exactly what the text says.",
                    model=model,
                )
                text_summary, terms = _split_terms(raw)
                failures = 0
            except Exception as e:
                failures += 1
                print(f"[DEEP SUMMARY] LLM unit failed ({type(e).__name__}); using extractive for this unit")
                if failures >= 3:
                    use_llm = False  # the model is not usable right now; finish the rest quickly
        if not text_summary:
            text_summary = extractive_summary(unit, 4)
        unit_results[idx].append(text_summary)
        ch["key_terms"] = list(dict.fromkeys(ch["key_terms"] + terms))[:10]
        ch["summary"] = " ".join(unit_results[idx])[:2200]
        done += 1
        if not publish("running"):
            return

    # ── reduce: overview, key points, concepts, definitions, notes ──
    digest = "\n\n".join(f"Chapter {c['chapter']}: {c['title']} (pages {c['page']}-{c['page_end']})\n{c['summary']}" for c in chapters)
    if len(digest) > 11000:
        step = 11000 // max(1, len(chapters))
        digest = "\n\n".join(f"Chapter {c['chapter']}: {c['title']}\n{c['summary'][:max(200, step - 80)]}" for c in chapters)

    # Two smaller calls instead of one big JSON answer: far less likely to time out on a CPU-bound model,
    # and if one fails only that part falls back to extractive text.
    final: Dict[str, Any] = {}

    def ask_json(prompt: str, num_predict: int) -> Optional[Dict[str, Any]]:
        if not use_llm:
            return None
        try:
            raw = llm_text(prompt + "\n\n" + digest, system="You are a JSON-only API that outputs structured study data in English. Use only information in the text given.",
                           model=model, num_predict=num_predict, timeout=FINAL_TIMEOUT, json_mode=True)
            return llama_service._parse_json_safely(raw)
        except Exception as e:
            print(f"[DEEP SUMMARY] final step failed ({type(e).__name__}); using extractive text for that part")
            return None

    part1 = ask_json("From these chapter summaries return ONLY JSON with keys: title, overview (3-4 sentences about the whole book), "
                     "main_takeaway (one sentence), key_points (5-8 strings), topics_covered (5-10 short tags).", 600)
    part2 = ask_json("From these chapter summaries return ONLY JSON with keys: concepts (4-6 objects with name, explanation, how_it_works, example), "
                     "definitions (6-10 objects with term, definition), important_notes (4-8 objects with note, type, page).", 900)
    if part1 and part1.get("overview"):
        final.update({k: part1[k] for k in ("title", "overview", "main_takeaway", "key_points", "topics_covered") if part1.get(k)})
    if part2:
        final.update({k: part2[k] for k in ("concepts", "definitions", "important_notes") if part2.get(k)})
    if not final.get("overview"):
        final["overview"] = extractive_summary(digest, 4)
    if not final.get("key_points"):
        final["key_points"] = [c["summary"].split(". ")[0].strip().rstrip(".") + "." for c in chapters if c["summary"]][:8]
    if not final.get("topics_covered"):
        final["topics_covered"] = [c["title"] for c in chapters][:10]
    if not final.get("definitions"):
        terms = [(t, c["title"]) for c in chapters for t in c.get("key_terms", [])][:10]
        final["definitions"] = [{"term": t, "definition": f"Key term from {ch}."} for t, ch in terms]
    final.setdefault("title", title)
    final.setdefault("main_takeaway", final["overview"].split(". ")[0].strip().rstrip(".") + ".")

    final["chapters"] = [{k: v for k, v in c.items() if not k.startswith("_")} for c in chapters]
    final["complete_summary"] = final.get("overview", "")

    def finish(d):
        d.update(final)
        d["summary_state"] = "done"
        d["summary_progress"] = {"done": total, "total": total}
        d["summary_engine"] = "llm" if use_llm else "extractive"
    save(finish)
    print(f"[DEEP SUMMARY] Book {book_id}: {total} units over {len(pages)} pages summarised in {round(time.time() - started)}s")
