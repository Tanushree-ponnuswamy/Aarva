"""Tests B (answer quality) + chat latency + resource use.
Usage: python run_answers.py <textbook.pdf> <work-dir> <out.json>
Needs the index built by run_retrieval.py (same work-dir) and Ollama with the Qwen model running.
"""
import os, sys, json, time, re, threading, subprocess
pdf_path, work, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
os.environ["CHROMA_PERSIST_DIR"] = os.path.join(work, "chroma")
os.environ.setdefault("APP_ENV", "testing")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.dirname(__file__))
from questions import IN_DOCUMENT, OUT_OF_DOCUMENT, MULTI_TURN
import fitz
from services.llama_service import llama_service

BOOK_ID = 1
doc = fitz.open(pdf_path)
page_text = lambda p: doc[p - 1].get_text().lower() if 1 <= p <= len(doc) else ""
REFUSAL = ("couldn't find", "could not find", "not in your document", "isn't in your document", "does not contain", "no information", "not mentioned")

# ── resource sampler: GPU and this process's memory while the model answers ──
peak = {"gpu_util_percent": 0, "gpu_mem_mb": 0, "process_ram_mb": 0}
stop = threading.Event()
def sampler():
    try:
        import psutil; proc = psutil.Process()
    except Exception:
        proc = None
    while not stop.is_set():
        try:
            o = subprocess.run(["nvidia-smi", "--query-gpu=utilization.gpu,memory.used", "--format=csv,noheader,nounits"], capture_output=True, text=True, timeout=5).stdout.strip().split(",")
            peak["gpu_util_percent"] = max(peak["gpu_util_percent"], int(o[0])); peak["gpu_mem_mb"] = max(peak["gpu_mem_mb"], int(o[1]))
        except Exception:
            pass
        if proc:
            peak["process_ram_mb"] = max(peak["process_ram_mb"], round(proc.memory_info().rss / 1e6))
        stop.wait(3)
threading.Thread(target=sampler, daemon=True).start()

def ask(q, history=None):
    t = time.time()
    r = llama_service.chat_response(query=q, textbook_id=BOOK_ID, language="English", conversation_history=history or [], doc_title="11th General English")
    return r, time.time() - t

def cited_pages(ans):
    return sorted({int(n) for n in re.findall(r"[Pp]age[s]?\s*(\d+)", ans)})

def words(s): return set(w for w in re.findall(r"[a-z']{4,}", s.lower()))

rows = []; lat = []
for q, pages, kws, kind in IN_DOCUMENT:
    r, dt = ask(q); a = r["response"]; low = a.lower(); lat.append(dt)
    refused = any(p in low for p in REFUSAL)
    correct = any(k.lower() in low for k in kws) and not refused
    cites = cited_pages(a)
    cite_hit = bool(cites) and any(c in pages for c in cites)
    cites_valid = [any(k.lower() in page_text(c) for k in kws) for c in cites]
    src_pages = [s["page"] for s in r.get("sources", [])]
    src_text = " ".join(page_text(p) for p in src_pages)
    sents = [s for s in re.split(r"(?<=[.!?])\s+", re.sub(r"[*#>`]", "", a)) if len(s) > 25 and not any(p in s.lower() for p in REFUSAL)]
    sup = [len(words(s) & words(src_text)) / max(1, len(words(s))) >= 0.6 for s in sents]
    rows.append({"q": q, "kind": kind, "seconds": round(dt, 1), "correct": correct, "refused": refused, "cites": cites, "cites_answer_page": cite_hit,
                 "cited_pages_contain_fact": cites_valid, "retrieved_pages": src_pages, "sentences": len(sents), "sentences_supported": sum(sup),
                 "fallback": "not reachable" in low, "answer": a[:300].replace("\n", " ")})
    print(("OK " if correct else "-- "), f"{dt:5.1f}s", q[:60], "| cites", cites, flush=True)

ood = []
for q in OUT_OF_DOCUMENT:
    r, dt = ask(q); low = r["response"].lower(); lat.append(dt)
    ood.append({"q": q, "seconds": round(dt, 1), "admits_not_found": any(p in low for p in REFUSAL), "answer": r["response"][:200].replace("\n", " ")})
    print(("OK " if ood[-1]["admits_not_found"] else "-- "), f"{dt:5.1f}s OOD", q[:50], flush=True)

multi = []
for q1, q2, kws in MULTI_TURN:
    r1, d1 = ask(q1); lat.append(d1)
    hist = [{"from": "user", "text": q1}, {"from": "ai", "text": r1["response"]}]
    r2, d2 = ask(q2, hist); lat.append(d2)
    ok = any(k in r2["response"].lower() for k in kws) and not any(p in r2["response"].lower() for p in REFUSAL)
    multi.append({"first": q1, "follow_up": q2, "keeps_context": ok, "answer": r2["response"][:240].replace("\n", " ")})
    print(("OK " if ok else "-- "), "multi-turn:", q2, flush=True)

stop.set()
def pct(n, d): return round(100 * n / d, 1) if d else None
ind = [r for r in rows]
cite_total = sum(len(r["cited_pages_contain_fact"]) for r in ind)
cite_good = sum(sum(r["cited_pages_contain_fact"]) for r in ind)
lat_sorted = sorted(lat)
res = {
    "in_document_questions": len(ind),
    "answer_correct_percent": {"all": pct(sum(r["correct"] for r in ind), len(ind)),
                               "keyword": pct(sum(r["correct"] for r in ind if r["kind"] == "keyword"), sum(1 for r in ind if r["kind"] == "keyword")),
                               "paraphrase": pct(sum(r["correct"] for r in ind if r["kind"] == "paraphrase"), sum(1 for r in ind if r["kind"] == "paraphrase"))},
    "false_refusal_percent": pct(sum(r["refused"] for r in ind), len(ind)),
    "answers_with_a_page_citation_percent": pct(sum(1 for r in ind if r["cites"]), len(ind)),
    "answers_citing_the_right_page_percent": pct(sum(r["cites_answer_page"] for r in ind), len(ind)),
    "individual_citations_correct_percent": pct(cite_good, cite_total), "individual_citations_checked": cite_total,
    "sentences_supported_by_source_percent_(proxy)": pct(sum(r["sentences_supported"] for r in ind), sum(r["sentences"] for r in ind)),
    "out_of_document": {"questions": len(ood), "admitted_not_found_percent": pct(sum(o["admits_not_found"] for o in ood), len(ood))},
    "multi_turn": {"conversations": len(multi), "kept_context_percent": pct(sum(m["keeps_context"] for m in multi), len(multi))},
    "fallback_answers": sum(r["fallback"] for r in ind),
    "latency_seconds": {"calls": len(lat), "p50": round(lat_sorted[len(lat_sorted) // 2], 1), "p95": round(lat_sorted[int(len(lat_sorted) * 0.95) - 1], 1),
                        "mean": round(sum(lat) / len(lat), 1), "max": round(max(lat), 1)},
    "peak_resources": peak,
    "rows": rows, "out_of_document_rows": ood, "multi_turn_rows": multi,
}
json.dump(res, open(out_path, "w"), indent=1)
print("ANSWERS_DONE", json.dumps({k: v for k, v in res.items() if not k.endswith("rows") and k != "rows"}), flush=True)
