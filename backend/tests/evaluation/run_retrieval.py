"""Tests A (retrieval) + indexing speed.   Usage: python run_retrieval.py <path-to-textbook.pdf> <work-dir> <out.json>

Builds the search index of the real textbook (timing it), then asks every question in questions.py and checks
whether the page holding the answer is among the top-5 results for: dense-only, keyword-only (BM25), and hybrid.
"""
import os, sys, json, time, re
pdf_path, work, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(work, exist_ok=True)
os.environ["CHROMA_PERSIST_DIR"] = os.path.join(work, "chroma")
os.environ.setdefault("APP_ENV", "testing")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.dirname(__file__))
from questions import IN_DOCUMENT
import fitz

BOOK_ID = 1
res = {}

from services.document_parser import parse_document
from services.chunking_service import chunking_service
from database.chroma import chroma_store
from services.hybrid_retrieval import hybrid_retrieval_engine as HR, _tokenize, _QUERY_STOP
from rank_bm25 import BM25Okapi

data = open(pdf_path, "rb").read()
t = time.time(); pr = parse_document(data, os.path.basename(pdf_path)); t_parse = time.time() - t
t = time.time(); chunks = chunking_service.chunk_parsed_result(parse_result=pr, file_name="book.pdf"); t_chunk = time.time() - t
existing = chroma_store.collection.get(where={"textbook_id": BOOK_ID}, include=[])["ids"]
t_embed = None
if len(existing) < len(chunks):
    t = time.time()
    chroma_store.add_textbook_chunks(textbook_id=BOOK_ID, book_title="11th General English", chunks=[c.to_dict() for c in chunks], file_name="book.pdf", file_type="pdf")
    t_embed = time.time() - t
n_chunks = chroma_store.collection.count()
import numpy as np
def zero_vectors():
    e = chroma_store.collection.get(where={"textbook_id": BOOK_ID}, include=["embeddings"])["embeddings"]
    return int((np.abs(np.array(e)).sum(axis=1) == 0).sum())
zero_before = zero_vectors()
t = time.time(); repaired = chroma_store.repair_zero_vectors(BOOK_ID); t_repair = time.time() - t
zero_after = zero_vectors()
res["embedding_health"] = {"passages": n_chunks, "all_zero_vectors_before_repair": zero_before, "repaired": repaired, "all_zero_vectors_after_repair": zero_after}
res["indexing"] = {"pages": pr.page_count, "words_extracted": pr.word_count, "chunks": len(chunks),
                   "parse_seconds": round(t_parse, 1), "chunk_seconds": round(t_chunk, 2),
                   "embed_seconds": round(t_embed, 1) if t_embed else "reused earlier index",
                   "embed_chunks_per_second": round(len(chunks) / t_embed, 2) if t_embed else None}
print("indexed:", res["indexing"], flush=True)

# sanity: does every expected keyword really occur on the answer page? (checks my own question set)
doc = fitz.open(pdf_path)
bad = []
for q, pages, kws, kind in IN_DOCUMENT:
    text = " ".join(doc[p - 1].get_text().lower() for p in pages)
    if not any(k.lower() in text for k in kws):
        bad.append(q)
res["question_set_check"] = {"questions": len(IN_DOCUMENT), "answer_not_on_stated_page": bad}

corpus = HR._get_corpus_chunks(BOOK_ID)
tok_corpus = [_tokenize(c["content"]) for c in corpus]
bm25 = BM25Okapi(tok_corpus)

def page_of(meta):
    return int(meta.get("page") or meta.get("page_number") or 0)

def dense(q, k=5):
    r = chroma_store.query_similar_context(query=q, textbook_id=BOOK_ID, n_results=k)
    return [page_of(x.get("metadata", {})) for x in r][:k]

def sparse(q, k=5):
    toks = [w for w in _tokenize(q) if w not in _QUERY_STOP] or _tokenize(q)
    scores = bm25.get_scores(toks)
    order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
    return [page_of(corpus[i]["metadata"]) for i in order if scores[i] > 0]

def hybrid(q, k=5):
    return [int(x["metadata"]["page"]) for x in HR.retrieve(query=q, textbook_id=BOOK_ID, top_k=k)]

methods = {"hybrid": hybrid, "dense_only": dense, "keyword_only_bm25": sparse}
rows = []
agg = {m: {"all": [], "keyword": [], "paraphrase": []} for m in methods}
mrr = {m: {"all": [], "keyword": [], "paraphrase": []} for m in methods}
lat = {m: [] for m in methods}
for q, pages, kws, kind in IN_DOCUMENT:
    row = {"q": q, "answer_pages": pages, "kind": kind}
    for m, fn in methods.items():
        t = time.time(); got = fn(q); lat[m].append(time.time() - t)
        hit = any(p in pages for p in got)
        rr = next((1 / (i + 1) for i, p in enumerate(got) if p in pages), 0.0)
        row[m] = {"pages": got, "hit": hit}
        for grp in ("all", kind):
            agg[m][grp].append(1 if hit else 0); mrr[m][grp].append(rr)
    rows.append(row)
    print(("OK " if row["hybrid"]["hit"] else "-- "), kind[:4], q[:70], "->", row["hybrid"]["pages"], flush=True)

def pct(x): return round(100 * sum(x) / len(x), 1) if x else None
def mean(x): return round(sum(x) / len(x), 2) if x else None
res["recall_at_5_percent"] = {m: {g: pct(v) for g, v in agg[m].items()} for m in methods}
res["mrr"] = {m: {g: mean(v) for g, v in mrr[m].items()} for m in methods}
res["median_retrieval_ms"] = {m: round(sorted(v)[len(v) // 2] * 1000) for m, v in lat.items()}
res["questions"] = rows
json.dump(res, open(out_path, "w"), indent=1)
print("RETRIEVAL_DONE", json.dumps({k: res[k] for k in ("recall_at_5_percent", "mrr", "median_retrieval_ms", "question_set_check")}), flush=True)
