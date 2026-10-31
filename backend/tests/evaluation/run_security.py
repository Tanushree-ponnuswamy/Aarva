"""Tests G (security and reliability).  Usage: python run_security.py <out.json>
Runs the app in-process against a throw-away database; heavy AI parts are not needed.
"""
import os, sys, json, tempfile, types
out_path = sys.argv[1]
tmp = tempfile.mkdtemp()
os.environ.update({"DATABASE_URL": f"sqlite:///{tmp}/sec.db", "CHROMA_PERSIST_DIR": f"{tmp}/chroma", "JWT_SECRET": "z" * 48,
                   "APP_ENV": "testing", "ENABLE_DEMO_LOGIN": "false", "ADMIN_PASSWORD": "correct-horse-battery-staple"})
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from fastapi.testclient import TestClient
import app as A
from services.email_service import email_service
from services.rate_limit import rate_limiter

sent = {}
def fake_send(email, code):  # capture the code instead of e-mailing it
    sent[email] = code
    return {"success": True}
email_service.send_verification_email = fake_send
PW = "a-long-test-password-1"
res = {}
with TestClient(A.app) as c:
    def account(email):
        c.post("/api/auth/signup", json={"name": email.split("@")[0], "email": email, "password": PW})
        r = c.post("/api/auth/login", json={"email": email, "password": PW}).json()
        return r.get("access_token") or r.get("token")

    # 1. Rate limit: wrong passwords for one account
    account("victim@example.com")
    rate_limiter._hits.clear()  # count only the wrong attempts below
    codes = [c.post("/api/auth/login", json={"email": "victim@example.com", "password": "wrong-password-xyz"}).status_code for _ in range(9)]
    res["rate_limit_wrong_logins"] = {"status_codes": codes, "blocked_at_attempt": next((i + 1 for i, s in enumerate(codes) if s == 429), None),
                                      "pass": codes[:8].count(401) == 8 and codes[8] == 429}
    rate_limiter._hits.clear()

    # 2. OTP: five wrong codes destroy the code, so even the right code no longer works
    c.post("/api/auth/send-otp", json={"email": "otp@example.com", "purpose": "signup"})
    right = sent.get("otp@example.com")
    wrong = [c.post("/api/auth/verify-otp", json={"email": "otp@example.com", "code": "0000" if right != "0000" else "1111"}).status_code for _ in range(5)]
    after = c.post("/api/auth/verify-otp", json={"email": "otp@example.com", "code": right}).status_code
    res["otp_five_wrong_codes"] = {"wrong_attempt_codes": wrong, "right_code_afterwards": after, "pass": all(s == 400 for s in wrong) and after == 400}
    rate_limiter._hits.clear()

    # 3. Logout: the old token must stop working
    tok = account("logout@example.com"); H = {"Authorization": f"Bearer {tok}"}
    before = c.get("/api/auth/me", headers=H).status_code
    c.post("/api/auth/logout", headers=H)
    after = c.get("/api/auth/me", headers=H).status_code
    res["logout_token_reuse"] = {"before_logout": before, "after_logout": after, "pass": before == 200 and after == 401}

    # 4. Ownership: user B asks for user A's book
    ta = account("alice@example.com"); tb = account("bob@example.com")
    import fitz
    d = fitz.open(); p = d.new_page(); p.insert_text((72, 72), "Alice's private notes."); pdf = d.tobytes()
    uid_a = c.get("/api/auth/me", headers={"Authorization": f"Bearer {ta}"}).json()["id"]
    bid = c.post("/api/textbooks/upload", data={"user_id": str(uid_a), "title": "Alice Notes"}, files={"file": ("a.pdf", pdf, "application/pdf")},
                 headers={"Authorization": f"Bearer {ta}"}).json()["textbook"]["id"]
    HB = {"Authorization": f"Bearer {tb}"}
    checks = {"open file": c.get(f"/api/textbooks/{bid}/file", headers=HB).status_code,
              "summary": c.get(f"/api/summary/{bid}", headers=HB).status_code,
              "status": c.get(f"/api/textbooks/{bid}/status", headers=HB).status_code,
              "delete": c.delete(f"/api/textbooks/{bid}", headers=HB).status_code,
              "chat": c.post("/api/summary/chat", json={"query": "hi", "textbook_id": bid}, headers=HB).status_code,
              "B's library contains it": any(b["id"] == bid for b in c.get("/api/textbooks/", headers=HB).json())}
    res["ownership_other_users_book"] = {"responses": checks,
                                        "pass": all(v in (403, 404) for k, v in checks.items() if k != "B's library contains it") and not checks["B's library contains it"]}
    # 5. No token at all
    res["no_token"] = {"library": c.get("/api/textbooks/").status_code, "pass": c.get("/api/textbooks/").status_code == 401}

res["all_pass"] = all(v.get("pass") for v in res.values() if isinstance(v, dict))
json.dump(res, open(out_path, "w"), indent=1)
print("SECURITY_DONE", json.dumps(res), flush=True)
