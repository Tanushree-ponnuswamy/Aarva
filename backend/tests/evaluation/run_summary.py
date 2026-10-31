"""Tests C (summaries).  Usage: python run_summary.py <textbook.pdf> <mode> <out.json> [max_lessons]
  mode "offline": Ollama is made unreachable -> the extractive fallback summarises ALL pages (long-document + fallback tests)
  mode "llm":     real Qwen model summarises the first max_lessons lessons (speed + faithfulness + coverage)
"""
import os, sys, json, time, re, tempfile
pdf_path, mode, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
max_lessons = int(sys.argv[4]) if len(sys.argv) > 4 else 3
tmp = tempfile.mkdtemp()
os.environ.update({"DATABASE_URL": f"sqlite:///{tmp}/s.db", "CHROMA_PERSIST_DIR": f"{tmp}/chroma", "JWT_SECRET": "s" * 48, "APP_ENV": "testing"})
if mode == "offline":
    os.environ["OLLAMA_BASE_URL"] = "http://127.0.0.1:9"  # nothing listens here: the model is "stopped"
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from collections import Counter

from database.postgres import Base, engine, SessionLocal
from models.models import User, Textbook
from services.document_parser import parse_document
from services.knowledge_base_service import knowledge_base_service as K
from services import deep_summary as ds

Base.metadata.create_all(bind=engine)
db = SessionLocal()
u = User(name="T", email="t@example.com", password_hash="x", role="student"); db.add(u); db.commit()

pr = parse_document(open(pdf_path, "rb").read(), "book.pdf")
sections = K._build_document_sections(pr, "11th General English")
all_lessons = len(sections)
if mode == "llm":
    sections = sections[:max_lessons]
book = Textbook(user_id=u.id, title="11th General English", file_name="book.pdf", status="processed", summary_data={}); db.add(book); db.commit()

t = time.time()
ds.run_deep_summary(book.id, pr.pages, sections, "11th General English", "book.pdf", db)
elapsed = time.time() - t
db.expire_all(); data = db.get(Textbook, book.id).summary_data
chs = data["chapters"]
page_text = lambda a, b: " ".join((pr.pages[p - 1].text or "") for p in range(a, min(b, len(pr.pages)) + 1))
STOP = set("that this with from have were been their there which would about these those other into than then them they when what will your also more most some such only very over each both".split())
words = lambda s: [w for w in re.findall(r"[a-z']{5,}", s.lower()) if w not in STOP]

# faithfulness proxy: a summary sentence is "supported" when >= 70% of its longer words occur in the pages it summarises
sent_total = sent_ok = 0
for c in chs:
    src = set(words(page_text(c["page"], c["page_end"])))
    for s in re.split(r"(?<=[.!?])\s+", c.get("summary", "")):
        w = words(s)
        if len(w) < 4: continue
        sent_total += 1; sent_ok += (sum(1 for x in w if x in src) / len(w)) >= 0.7
# coverage proxy: share of each lesson's 8 most frequent distinctive words that show up in its summary or key terms
cov = []
for c in chs:
    freq = Counter(words(page_text(c["page"], c["page_end"]))).most_common(8)
    mine = set(words(c.get("summary", "") + " " + " ".join(c.get("key_terms", []))))
    if freq: cov.append(sum(1 for w, _ in freq if w in mine) / len(freq))

res = {
    "mode": mode, "pages_in_book": pr.page_count, "lessons_detected": all_lessons, "lessons_summarised": len(chs),
    "front_matter_skipped": sections[0]["page"] > 1 if sections else None, "first_lesson_page": sections[0]["page"] if sections else None,
    "last_lesson_end_page": chs[-1]["page_end"] if chs else None,
    "summary_state": data.get("summary_state"), "engine": data.get("summary_engine"), "progress": data.get("summary_progress"),
    "seconds_total": round(elapsed, 1), "seconds_per_unit": round(elapsed / max(1, data["summary_progress"]["total"]), 1),
    "lessons_with_non_empty_summary": sum(1 for c in chs if c.get("summary")),
    "later_lessons_with_summary(page>=100)": [c["title"] for c in chs if c["page"] >= 100 and c.get("summary")][:6],
    "has_overview": bool(data.get("overview")), "key_points": len(data.get("key_points", [])), "definitions": len(data.get("definitions", [])), "concepts": len(data.get("concepts", [])),
    "summary_sentences_checked": sent_total, "sentences_supported_percent_(proxy)": round(100 * sent_ok / sent_total, 1) if sent_total else None,
    "lesson_term_coverage_percent_(proxy)": round(100 * sum(cov) / len(cov), 1) if cov else None,
    "sample": [{"lesson": c["title"], "pages": f'{c["page"]}-{c["page_end"]}', "summary": c["summary"], "key_terms": c.get("key_terms", [])} for c in chs[:3]],
}
json.dump(res, open(out_path, "w"), indent=1)
print("SUMMARY_DONE", json.dumps({k: v for k, v in res.items() if k != "sample"}), flush=True)
