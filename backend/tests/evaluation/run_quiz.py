"""Tests D (quizzes).  Usage: python run_quiz.py <textbook.pdf> <work-dir> <mode> <out.json> [questions_per_lesson] [lessons]
  mode "llm":     real Qwen model writes the questions
  mode "offline": Ollama made unreachable -> questions are built straight from the document text
Needs the index built by run_retrieval.py (same work-dir).
"""
import os, sys, json, time, re
pdf_path, work, mode, out_path = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
per = int(sys.argv[5]) if len(sys.argv) > 5 else 5
n_lessons = int(sys.argv[6]) if len(sys.argv) > 6 else 4
os.environ["CHROMA_PERSIST_DIR"] = os.path.join(work, "chroma")
os.environ.setdefault("APP_ENV", "testing")
if mode == "offline":
    os.environ["OLLAMA_BASE_URL"] = "http://127.0.0.1:9"
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from services.document_parser import parse_document
from services.knowledge_base_service import knowledge_base_service as K
import services.quiz_service as Q

pr = parse_document(open(pdf_path, "rb").read(), "book.pdf")
sections = K._build_document_sections(pr, "11th General English")
# pick lessons spread over the book (not only the first ones)
step = max(1, len(sections) // n_lessons)
chosen = [sections[i] for i in range(0, len(sections), step)][:n_lessons]

calls = {"llm_calls": 0, "llm_valid_first_try": 0}
orig = Q._call_ollama_for_questions
def counted(*a, **k):
    calls["llm_calls"] += 1
    r = orig(*a, **k)
    if r: calls["llm_valid_first_try"] += 1
    return r
Q._call_ollama_for_questions = counted

STOP = set("that this with from have were been their there which would about these those other into than then them they when what will your also more most some such only very over each both".split())
words = lambda s: [w for w in re.findall(r"[a-z0-9']{4,}", s.lower()) if w not in STOP]
rows = []; per_lesson = []
t_all = time.time()
for sec in chosen:
    lo, hi = sec["page"], sec["page_end"]
    t = time.time()
    qs = Q.generate_quiz_questions(textbook_id=1, topic=sec["title"], num_questions=per, difficulty="mixed", language="English", page_range=(lo, hi))
    dt = time.time() - t
    lesson_text = " ".join((pr.pages[p - 1].text or "") for p in range(lo, hi + 1)).lower()
    pages_used = set()
    n_valid = 0
    for q in qs:
        opts = q.get("options", [])
        fmt_ok = len(opts) == 4 and isinstance(q.get("correct_option"), int) and 0 <= q["correct_option"] < 4 and len(set(opts)) == 4 and bool(q.get("question"))
        n_valid += fmt_ok
        ans = opts[q["correct_option"]] if fmt_ok else ""
        # answerable proxy: the correct answer (or most of its words) appears in the lesson text
        aw = words(ans)
        in_text = ans.lower() in lesson_text or (aw and sum(1 for w in aw if w in lesson_text) / len(aw) >= 0.8)
        # evidence page(s): where does the correct answer occur inside this lesson?
        ev = [p for p in range(lo, hi + 1) if ans and ans.lower() in (pr.pages[p - 1].text or "").lower()]
        pages_used.update(ev[:1])
        rows.append({"lesson": sec["title"], "pages": f"{lo}-{hi}", "source": q.get("source"), "difficulty": q.get("difficulty"), "question": q.get("question", "")[:400],
                     "options": opts, "marked_answer": ans, "format_ok": fmt_ok, "answer_appears_in_lesson_text": bool(in_text), "evidence_pages": ev[:3], "explanation": (q.get("explanation") or "")[:240]})
    per_lesson.append({"lesson": sec["title"], "pages": f"{lo}-{hi}", "questions": len(qs), "format_ok": n_valid, "seconds": round(dt, 1), "distinct_evidence_pages": len(pages_used), "pages_in_lesson": hi - lo + 1})
    print("lesson done:", sec["title"][:40], len(qs), "questions", round(dt), "s", flush=True)

pct = lambda a, b: round(100 * a / b, 1) if b else None
res = {"mode": mode, "lessons_tested": len(chosen), "questions_total": len(rows), "seconds_total": round(time.time() - t_all, 1),
       "generation_calls": calls, "valid_format_percent": pct(sum(r["format_ok"] for r in rows), len(rows)),
       "answer_appears_in_lesson_text_percent": pct(sum(r["answer_appears_in_lesson_text"] for r in rows), len(rows)),
       "source_counts": {s: sum(1 for r in rows if r["source"] == s) for s in {r["source"] for r in rows}},
       "difficulty_counts": {d: sum(1 for r in rows if r["difficulty"] == d) for d in {r["difficulty"] for r in rows}},
       "per_lesson": per_lesson, "rows": rows}
json.dump(res, open(out_path, "w"), indent=1)
print("QUIZ_DONE", json.dumps({k: v for k, v in res.items() if k != "rows"}), flush=True)
