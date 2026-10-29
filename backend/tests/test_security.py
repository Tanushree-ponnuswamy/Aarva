"""
Security regression tests. Run from backend/:   python -m pytest tests/test_security.py -q
(or: python tests/test_security.py)

Heavy AI dependencies (ChromaDB / Ollama / LLM services) are stubbed, so this only
needs: fastapi, sqlalchemy, bcrypt, pyjwt, python-dotenv, httpx, python-multipart.
"""
import os, sys, tempfile, types, time
from pathlib import Path

os.environ.update({
    "DATABASE_URL": f"sqlite:///{tempfile.mkdtemp()}/test.db",
    "JWT_SECRET": "x" * 48,
    "APP_ENV": "testing",
    "ENABLE_DEMO_LOGIN": "true",
    "ADMIN_PASSWORD": "correct-horse-battery-staple",
})
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

def _stub(name, **attrs):
    m = types.ModuleType(name); m.__dict__.update(attrs); sys.modules[name] = m

class _Dummy:
    def __getattr__(self, _): return lambda *a, **k: {"response": "stub"}
_stub("database.chroma", chroma_store=_Dummy())
_stub("services.llama_service", llama_service=_Dummy())
_stub("services.knowledge_base_service", knowledge_base_service=_Dummy())
_stub("services.quiz_service", generate_quiz_questions=lambda **k: [], get_difficulty_distribution=lambda q: {})

from fastapi.testclient import TestClient
import app as app_module
from database.postgres import SessionLocal
from models.models import Textbook, User
from services.email_service import email_service
from services.rate_limit import rate_limiter

email_service.send_verification_email = lambda *a, **k: {"success": True}  # no real SMTP

PW = "a-long-test-password-1"
_n = [0]
def _new_user(c):
    _n[0] += 1
    email = f"user{_n[0]}-{int(time.time()*1000)}@example.com"
    r = c.post("/api/auth/signup", json={"name": f"User {_n[0]}", "email": email, "password": PW})
    assert r.status_code == 200, r.text
    d = r.json()
    return email, d["user"]["id"], {"Authorization": f"Bearer {d['token']}"}

def _book(owner_id):
    db = SessionLocal()
    b = Textbook(user_id=owner_id, title="T", file_name="t.txt", summary_data={})
    db.add(b); db.commit(); bid = b.id; db.close(); return bid

def run():
    with TestClient(app_module.app) as c:
        # 1. nothing sensitive is reachable without a token
        for method, url in [("get", "/api/admin/students"), ("get", "/api/admin/metrics"),
                            ("post", "/api/admin/students/1/toggle-status"),
                            ("get", "/api/student/dashboard/1"), ("post", "/api/student/award-xp"),
                            ("get", "/api/textbooks/?user_id=1"), ("delete", "/api/textbooks/1"),
                            ("get", "/api/textbooks/1/file"), ("get", "/api/summary/1"),
                            ("post", "/api/chat"), ("post", "/api/summary/chat"),
                            ("post", "/api/quiz/generate"), ("post", "/api/quiz/submit"),
                            ("get", "/api/quiz/leaderboard/top")]:
            r = getattr(c, method)(url, **({"json": {}} if method == "post" else {}))
            assert r.status_code == 401, (method, url, r.status_code)

        # 2. demo login only yields the demo user; its old published password no longer works
        r = c.post("/api/auth/demo-login", json={}); assert r.status_code == 200, r.text
        assert r.json()["user"]["email"] == "student@college.edu"
        r = c.post("/api/auth/login", json={"email": "student@college.edu", "password": "student123"})
        assert r.status_code == 401
        r = c.post("/api/auth/login", json={"email": "admin@aarva.edu", "password": "admin123"})
        assert r.status_code == 401

        # 3. generic login errors (no user enumeration / no length hints)
        email, uid, hdr = _new_user(c)
        r1 = c.post("/api/auth/login", json={"email": email, "password": "wrong-password-123"})
        r2 = c.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrong-password-123"})
        assert r1.status_code == r2.status_code == 401 and r1.json() == r2.json()
        assert c.post("/api/auth/login", json={"email": email, "password": PW}).status_code == 200

        # 4. students cannot reach admin API; admin can (after admin-login)
        assert c.get("/api/admin/students", headers=hdr).status_code == 403
        r = c.post("/api/auth/admin-login", json={"email": "admin@aarva.edu", "password": os.environ["ADMIN_PASSWORD"]})
        assert r.status_code == 200, r.text
        ah = {"Authorization": f"Bearer {r.json()['token']}"}
        assert c.get("/api/admin/students", headers=ah).status_code == 200
        assert c.post("/api/auth/login", json={"email": "admin@aarva.edu", "password": os.environ["ADMIN_PASSWORD"]}).status_code == 403

        # 5. IDOR: user A cannot read/modify/delete user B's data
        _, bid_user, bh = _new_user(c)
        book = _book(bid_user)
        assert c.get(f"/api/student/dashboard/{bid_user}", headers=hdr).status_code == 403
        assert c.put(f"/api/student/preferences/{bid_user}", headers=hdr, json={}).status_code == 403
        assert c.get(f"/api/textbooks/?user_id={bid_user}", headers=hdr).status_code == 403
        assert c.get(f"/api/textbooks/{book}/file", headers=hdr).status_code == 404
        assert c.delete(f"/api/textbooks/{book}", headers=hdr).status_code == 404
        assert c.get(f"/api/summary/{book}", headers=hdr).status_code == 404
        assert c.post("/api/summary/chat", headers=hdr, json={"query": "hi", "textbook_id": book}).status_code == 404
        assert c.post("/api/chat", headers=hdr, json={"query": "hi", "textbook_id": book}).status_code == 404
        assert c.get(f"/api/textbooks/{book}/file", headers=bh).status_code == 200   # owner still works
        r = c.post("/api/student/award-xp", headers=hdr, json={"user_id": bid_user, "activity_type": "x", "xp_amount": 10**6})
        assert r.status_code == 200 and r.json()["awarded_xp"] <= 100                 # no XP minting / no cross-user XP

        # 6. logout really revokes the token
        assert c.get("/api/auth/me", headers=hdr).status_code == 200
        assert c.post("/api/auth/logout", headers=hdr).status_code == 200
        assert c.get("/api/auth/me", headers=hdr).status_code == 401
        # forged / unsigned tokens
        assert c.get("/api/auth/me", headers={"Authorization": "Bearer demo_token_alex_morgan"}).status_code == 401

        # 7. check-email leaks nothing but a boolean
        assert set(c.post("/api/auth/check-email", json={"email": email}).json()) == {"email", "is_registered"}

        # 8. CORS: random *.onrender.com origin is not trusted
        r = c.options("/api/auth/login", headers={"Origin": "https://evil.onrender.com",
                      "Access-Control-Request-Method": "POST"})
        assert "access-control-allow-origin" not in r.headers
        r = c.options("/api/auth/login", headers={"Origin": "https://aarva-1.onrender.com",
                      "Access-Control-Request-Method": "POST"})
        assert r.headers.get("access-control-allow-origin") == "https://aarva-1.onrender.com"

        # 9. login brute force is throttled
        victim, _, _ = _new_user(c)
        codes = [c.post("/api/auth/login", json={"email": victim, "password": f"guess-number-{i}-xx"}).status_code for i in range(10)]
        assert 429 in codes, codes

        assert c.get("/api/health").json()["status"] == "healthy"

def test_otp_policy():
    svc = type(email_service)()
    code = svc.generate_otp("a@example.com")
    assert len(code) == 4 and code.isdigit()
    try: svc.generate_otp("a@example.com"); assert False, "cooldown not enforced"
    except ValueError as e: assert str(e) == "cooldown"
    wrong = "0000" if code != "0000" else "1111"
    for _ in range(5): assert svc.verify_otp("a@example.com", wrong) is False
    assert svc.verify_otp("a@example.com", code) is False        # destroyed after 5 bad guesses
    svc._send_log.clear()
    code = svc.generate_otp("a@example.com")
    assert svc.verify_otp("a@example.com", code) is True         # correct code works once
    assert svc.verify_otp("a@example.com", code) is False       # single use

def test_security_suite():
    run()

if __name__ == "__main__":
    test_otp_policy(); run(); print("ALL SECURITY TESTS PASSED")
