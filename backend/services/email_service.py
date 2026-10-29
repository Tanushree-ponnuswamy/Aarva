"""
AARVA Email Service
Handles dispatching branded HTML verification emails and OTP security notifications via SMTP.
Supports Gmail, Outlook, AWS SES, or any standard SMTP relay with STARTTLS.
"""

import os
import smtplib
import socket
import requests
import hmac
import secrets
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional
from config import settings


def _connect_ipv4(host: str, port: int, timeout: float, source_address=None):
    """Connect over IPv4 only. Some hosts (Render) resolve smtp.gmail.com to an IPv6 address they cannot route."""
    ip = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)[0][4][0]
    return socket.create_connection((ip, port), timeout, source_address)


class _IPv4SMTP(smtplib.SMTP):
    def _get_socket(self, host, port, timeout):
        return _connect_ipv4(host, port, timeout, self.source_address)


class _IPv4SMTP_SSL(smtplib.SMTP_SSL):
    def _get_socket(self, host, port, timeout):
        raw = _connect_ipv4(host, port, timeout, self.source_address)
        return self.context.wrap_socket(raw, server_hostname=self._host)


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.use_tls = settings.SMTP_USE_TLS
        
        # In-memory OTP storage with TTL: { email: { 'code': str, 'expires_at': float, 'attempts': int, 'created_at': float } }
        self._otp_store: Dict[str, Dict[str, Any]] = {}
        self._send_log: Dict[str, list] = {}
        self._verified_emails: Dict[str, float] = {}
        self.last_error: Optional[str] = None

    # ── OTP policy ───────────────────────────────────────────────────────
    OTP_TTL_SECONDS = 10 * 60          # code lifetime
    OTP_MAX_ATTEMPTS = 5               # wrong guesses before the code is destroyed
    OTP_RESEND_COOLDOWN_SECONDS = 60   # minimum gap between sends to one address
    OTP_MAX_SENDS_PER_HOUR = 5         # per address

    def generate_otp(self, email: str, length: int = 4) -> str:
        """Generate a cryptographically random numeric OTP (secrets, not random).

        Raises ValueError("cooldown"|"hourly_cap") when the address is being hammered.
        """
        email_clean = email.strip().lower()
        now = time.time()

        sends = [t for t in self._send_log.get(email_clean, []) if now - t < 3600]
        if sends and now - sends[-1] < self.OTP_RESEND_COOLDOWN_SECONDS:
            raise ValueError("cooldown")
        if len(sends) >= self.OTP_MAX_SENDS_PER_HOUR:
            raise ValueError("hourly_cap")
        sends.append(now)
        self._send_log[email_clean] = sends

        digits = 6 if length and length > 4 else 4
        code = "".join(secrets.choice("0123456789") for _ in range(digits))
        self._otp_store[email_clean] = {
            "code": code,
            "expires_at": now + self.OTP_TTL_SECONDS,
            "created_at": now,
            "attempts": 0,
        }
        return code

    def discard_otp(self, email: str) -> None:
        """Forget a code whose email could not be delivered, so the user can retry immediately."""
        email_clean = email.strip().lower()
        self._otp_store.pop(email_clean, None)
        sends = self._send_log.get(email_clean, [])
        if sends:
            sends.pop()

    def verify_otp(self, email: str, code: str) -> bool:
        """Verify an OTP. Single use; destroyed after too many wrong guesses."""
        email_clean = email.strip().lower()
        now = time.time()
        record = self._otp_store.get(email_clean)
        if not record:
            return False

        if now > record["expires_at"]:
            self._otp_store.pop(email_clean, None)
            return False

        if hmac.compare_digest(record["code"], (code or "").strip()):
            self._otp_store.pop(email_clean, None)  # consume
            self._verified_emails[email_clean] = now + (15 * 60)
            return True

        record["attempts"] += 1
        if record["attempts"] >= self.OTP_MAX_ATTEMPTS:
            self._otp_store.pop(email_clean, None)  # brute-force protection
        return False

    def is_email_verified(self, email: str) -> bool:
        """Check if an email has recently verified OTP and is eligible for signup or password reset."""
        email_clean = email.strip().lower()
        exp = self._verified_emails.get(email_clean)
        if exp and time.time() < exp:
            return True
        if exp:
            del self._verified_emails[email_clean]
        return False

    def consume_verified_email(self, email: str) -> None:
        """Consume verified status upon successful account creation or password reset."""
        email_clean = email.strip().lower()
        self._verified_emails.pop(email_clean, None)
        self._otp_store.pop(email_clean, None)

    def get_html_template(self, code: str, recipient_email: str) -> str:
        """Render a modern, responsive HTML email template for email verification."""
        digits_html = "".join([
            f'<div style="display:inline-block; width:48px; height:56px; line-height:56px; margin:0 6px; font-size:32px; font-weight:700; color:#17142d; background:#f0f5ff; border:1.5px solid #d0e1fd; border-radius:12px; text-align:center;">{d}</div>'
            for d in code
        ])
        
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Aarva email</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#17142d;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f7fc; padding:40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:540px; background:#ffffff; border-radius:24px; box-shadow:0 12px 36px rgba(23,20,45,0.06); border:1px solid #e7ebf4; overflow:hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding:36px 40px 24px; background:linear-gradient(135deg, #0099ff 0%, #6366f1 100%); text-align:center; color:#ffffff;">
              <div style="display:inline-block; width:48px; height:48px; line-height:48px; background:rgba(255,255,255,0.2); border-radius:14px; font-size:22px; margin-bottom:12px;">✉️</div>
              <h1 style="margin:0; font-size:24px; font-weight:800; letter-spacing:-0.03em;">Verify Your Email</h1>
              <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">Aarva Adaptive Learning Platform</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#3e3859;">
                Hello,
              </p>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#5a5573;">
                Thank you for joining <strong>Aarva</strong>. Please use the four-digit verification code below to verify your email address (<strong>{recipient_email}</strong>) and activate your account.
              </p>

              <!-- OTP Code Display -->
              <div style="text-align:center; margin:32px 0; padding:24px; background:#f9fbff; border-radius:16px; border:1px dashed #bcd8fc;">
                <p style="margin:0 0 14px; font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#0077dd;">Your Verification Code</p>
                <div style="margin:0 auto;">
                  {digits_html}
                </div>
                <p style="margin:16px 0 0; font-size:13px; color:#787291;">
                  ⏳ This code expires in <strong>10 minutes</strong>.
                </p>
              </div>

              <p style="margin:0 0 12px; font-size:14px; line-height:1.6; color:#5a5573;">
                If you did not request this verification, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; background-color:#fafbff; border-top:1px solid #edf1f8; text-align:center;">
              <p style="margin:0; font-size:12px; color:#8d87a5;">
                © 2026 Aarva Learning Studio • Empowering your brightest ideas.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    def send_verification_email(self, recipient_email: str, code: str) -> Dict[str, Any]:
        """Send verification code to recipient via SMTP."""
        recipient_clean = recipient_email.strip().lower()
        subject = f"{code} is your Aarva verification code"

        # Create MIME message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = recipient_clean

        plain_text = f"Your Aarva email verification code is: {code}\n\nThis code expires in 10 minutes."
        html_text = self.get_html_template(code, recipient_clean)

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_text, "html"))

        # Render blocks outbound SMTP ports, so prefer an HTTPS email API when a key is configured.
        brevo_key = os.getenv("BREVO_API_KEY", "").strip()
        resend_key = os.getenv("RESEND_API_KEY", "").strip()
        if brevo_key or resend_key:
            try:
                if brevo_key:
                    resp = requests.post(
                        "https://api.brevo.com/v3/smtp/email",
                        headers={"api-key": brevo_key, "accept": "application/json"},
                        json={
                            "sender": {"name": self.from_name, "email": settings.BREVO_SENDER_EMAIL},
                            "to": [{"email": recipient_clean}],
                            "subject": subject,
                            "htmlContent": html_text,
                            "textContent": plain_text,
                        },
                        timeout=15,
                    )
                else:
                    resp = requests.post(
                        "https://api.resend.com/emails",
                        headers={"Authorization": f"Bearer {resend_key}"},
                        json={
                            "from": f"{self.from_name} <{settings.BREVO_SENDER_EMAIL}>",
                            "to": [recipient_clean],
                            "subject": subject,
                            "html": html_text,
                            "text": plain_text,
                        },
                        timeout=15,
                    )
                if resp.status_code >= 300:
                    raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:200]}")
                print(f"[EMAIL SERVICE] Dispatched verification email to {recipient_clean} via HTTPS API")
                return {"success": True, "message": f"Verification email sent to {recipient_clean}", "code": code}
            except Exception as e:
                print(f"[EMAIL SERVICE ERROR] HTTPS email API failed for {recipient_clean}: {e}")
                self.last_error = f"HTTPS API: {str(e)[:150]}"
                return {"success": False, "error_kind": "send", "error": str(e), "message": "Could not dispatch email.", "code": code}

        if not self.smtp_user or not self.smtp_password:
            print("[EMAIL SERVICE ERROR] No email credentials configured (set SMTP_USER/SMTP_PASSWORD or BREVO_API_KEY).")
            return {"success": False, "error_kind": "config", "error": "email credentials are not configured", "code": code}
        sender = self.from_email or self.smtp_user

        try:
            server = None
            last_error: Optional[Exception] = None
            # Try STARTTLS on the configured port first, then implicit TLS on 465.
            attempts = [(self.smtp_port, self.smtp_port == 465)]
            for extra, ssl_mode in ((2525, False), (587, False), (465, True)):
                if all(extra != a[0] for a in attempts):
                    attempts.append((extra, ssl_mode))
            for port, implicit_ssl in attempts:
                try:
                    print(f"[EMAIL SERVICE] Connecting to SMTP server {self.smtp_host}:{port}...")
                    if implicit_ssl:
                        server = _IPv4SMTP_SSL(self.smtp_host, port, timeout=8)
                    else:
                        server = _IPv4SMTP(self.smtp_host, port, timeout=8)
                        if self.use_tls:
                            server.starttls()
                    break
                except Exception as conn_err:
                    last_error = conn_err
                    server = None
            if server is None:
                raise last_error or ConnectionError("could not reach the mail server")

            server.login(self.smtp_user, self.smtp_password)
            server.sendmail(sender, recipient_clean, msg.as_string())
            server.quit()
            
            print(f"[EMAIL SERVICE] Successfully dispatched verification email to {recipient_clean}")
            return {"success": True, "message": f"Verification email sent to {recipient_clean}", "code": code}

        except Exception as e:
            print(f"[EMAIL SERVICE ERROR] Failed to send email via SMTP to {recipient_clean}: {type(e).__name__}: {e}")
            self.last_error = f"{type(e).__name__}: {str(e)[:120]}"
            kind = "auth" if isinstance(e, smtplib.SMTPAuthenticationError) else "unreachable" if isinstance(e, (OSError, TimeoutError)) else "send"
            # Still keep code in memory so user can verify via preview/console in local environments
            return {
                "success": False,
                "error_kind": kind,
                "error": str(e),
                "message": f"Could not dispatch email via SMTP ({e}).",
                "code": code
            }


email_service = EmailService()
