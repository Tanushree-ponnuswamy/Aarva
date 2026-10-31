"""Tests F (system performance).  Usage: python run_system.py <work-dir> <out.json>
  - keyword-search (BM25) cost as a book grows
  - processing time for 10- and 50-page documents (parse + index with real embeddings)
  - many users at once against a real running server (cheap endpoints: login check, library, summary)
"""
import os, sys, json, time, random, subprocess, tempfile, threading, statistics
work, out_path = sys.argv[1], sys.argv[2]
os.makedirs(work, exist_ok=True)
os.environ["CHROMA_PERSIST_DIR"] = os.path.join(work, "chroma_sys")
os.environ.setdefault("APP_ENV", "testing")
HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, BACKEND)
import requests, fitz
res = {}

# 1. BM25 cost: the keyword index is rebuilt for every question, so cost grows with the size of the book
from rank_bm25 import BM25Okapi
from services.hybrid_retrieval import _tokenize
random.seed(1)
vocab = [f"word{i}" for i in range(4000)]
scal = {}
for n in (100, 1000, 5000):
    corpus = [" ".join(random.choices(vocab, k=180)) for _ in range(n)]
    t = time.time()
    for _ in range(3):
        bm = BM25Okapi([_tokenize(c) for c in corpus]); bm.get_scores(["word12", "word345"])
    scal[f"{n}_passages_ms_per_question"] = round((time.time() - t) / 3 * 1000)
res["bm25_rebuild_per_question"] = scal

# 2. Processing time for small/medium documents (real embedding model)
from services.document_parser import parse_document
from services.chunking_service import chunking_service
from database.chroma import chroma_store
proc = {}
for pages in (10, 50):
    d = fitz.open()
    for i in range(pages):
        p = d.new_page(); y = 60
        for k in range(30):
            p.insert_text((50, y), f"Page {i} line {k}: students read the passage and answer questions about the main idea."); y += 15
    data = d.tobytes()
    t = time.time(); pr = parse_document(data, f"doc{pages}.pdf"); ch = chunking_service.chunk_parsed_result(parse_result=pr, file_name=f"doc{pages}.pdf")
    chroma_store.add_textbook_chunks(textbook_id=900 + pages, book_title="t", chunks=[c.to_dict() for c in ch], file_name="d.pdf", file_type="pdf")
    dt = time.time() - t
    proc[f"{pages}_pages"] = {"seconds": round(dt, 1), "seconds_per_page": round(dt / pages, 2), "passages": len(ch)}
    chroma_store.delete_textbook_chunks(textbook_id=900 + pages)
res["processing_time"] = proc

# 3. Concurrent users against a real server
tmp = tempfile.mkdtemp()
env = dict(os.environ, DATABASE_URL=f"sqlite:///{tmp}/load.db", CHROMA_PERSIST_DIR=f"{tmp}/chroma", JWT_SECRET="l" * 48, ENABLE_DEMO_LOGIN="true", APP_ENV="testing")
srv = subprocess.Popen([sys.executable, "-m", "uvicorn", "app:app", "--port", "8011"], cwd=BACKEND, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    base = "http://127.0.0.1:8011"
    for _ in range(60):
        try:
            if requests.get(base + "/api/health", timeout=2).status_code == 200: break
        except Exception:
            time.sleep(1)
    tok = requests.post(base + "/api/auth/demo-login", json={}).json()
    H = {"Authorization": "Bearer " + (tok.get("access_token") or tok.get("token"))}
    books = requests.get(base + "/api/textbooks/", headers=H).json()
    bid = books[0]["id"] if books else None
    load = {}
    for users in (5, 10, 20):
        lat, errs = [], 0
        lock = threading.Lock()
        def user():
            nonlocal_errs = 0
            for k in range(10):
                url = [base + "/api/auth/me", base + "/api/textbooks/", base + (f"/api/summary/{bid}" if bid else "/api/health")][k % 3]
                t = time.time()
                try:
                    ok = requests.get(url, headers=H, timeout=30).status_code == 200
                except Exception:
                    ok = False
                with lock:
                    lat.append(time.time() - t)
                    if not ok:
                        load.setdefault("_errors", 0)
                        load["_errors"] += 1
        ths = [threading.Thread(target=user) for _ in range(users)]
        t0 = time.time(); [t.start() for t in ths]; [t.join() for t in ths]
        s = sorted(lat)
        load[f"{users}_users"] = {"requests": len(s), "errors": load.pop("_errors", 0), "p50_ms": round(s[len(s) // 2] * 1000), "p95_ms": round(s[int(len(s) * 0.95) - 1] * 1000),
                                  "requests_per_second": round(len(s) / (time.time() - t0), 1)}
    res["concurrent_users_cheap_endpoints"] = load
finally:
    srv.terminate()
json.dump(res, open(out_path, "w"), indent=1)
print("SYSTEM_DONE", json.dumps(res), flush=True)
