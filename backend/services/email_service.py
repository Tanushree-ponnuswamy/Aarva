"""
AARVA Email Service
Handles dispatching branded HTML verification emails and OTP security notifications via SMTP.
Supports Gmail, Outlook, AWS SES, or any standard SMTP relay with STARTTLS.
"""

import smtplib
import secrets
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional
from config import settings

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.smtp_user if hasattr(settings, "smtp_user") else settings.SMTP_USER
        self.smtp_password = settings.smtp_password if hasattr(settings, "smtp_password") else settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.use_tls = settings.SMTP_USE_TLS
        
        # In-memory OTP storage with TTL: { email: { 'code': str, 'expires_at': float, 'attempts': int, 'created_at': float } }
        self._otp_store: Dict[str, Dict[str, Any]] = {}
        # In-memory verified email store: { email: expires_at float }
        self._verified_emails: Dict[str, float] = {}

    def generate_otp(self, email: str, length: int = 4, min_cooldown_sec: int = 30) -> str:
        """
        Generate a cryptographically secure numeric OTP code and store it with 10-minute expiry.
        Applies cooldown to prevent rapid-fire email flood attacks.
        """
        email_clean = email.strip().lower()
        now = time.time()
        
        existing = self._otp_store.get(email_clean)
        # If an active code was created very recently (< cooldown), reuse the active code to avoid spamming SMTP
        if existing and (now - existing.get("created_at", 0)) < min_cooldown_sec and now < existing.get("expires_at", 0):
            return existing["code"]

        # Generate cryptographically secure numeric code
        if length == 4:
            code = f"{secrets.randbelow(9000) + 1000}"
        else:
            code = f"{secrets.randbelow(900000) + 100000}"
            
        expires_at = now + (10 * 60) # 10 minutes
        self._otp_store[email_clean] = {
            "code": code,
            "expires_at": expires_at,
            "created_at": now,
            "attempts": 0
        }
        return code

    def verify_otp(self, email: str, code: str) -> bool:
        """
        Verify the OTP against stored code sent to email with timing attack
        resistance (secrets.compare_digest) and max 5 failed attempt brute-force mitigation.
        """
        email_clean = email.strip().lower()
        now = time.time()
            
        record = self._otp_store.get(email_clean)
        if not record:
            return False
            
        if now > record["expires_at"]:
            del self._otp_store[email_clean]
            return False
            
        # Check brute force attempts limit
        record["attempts"] = record.get("attempts", 0) + 1
        if record["attempts"] > 5:
            # Invalidate immediately on exceeding max attempts
            del self._otp_store[email_clean]
            return False

        # Constant-time comparison to prevent timing attacks
        if secrets.compare_digest(record["code"], code.strip()):
            # Consume OTP
            del self._otp_store[email_clean]
            # Mark email as verified for 15 minutes for registration flow
            self._verified_emails[email_clean] = now + (15 * 60)
            return True
            
        return False

    def is_email_verified(self, email: str) -> bool:
        """Check if an email has recently verified OTP and is eligible for signup."""
        email_clean = email.strip().lower()
        exp = self._verified_emails.get(email_clean)
        if exp and time.time() < exp:
            return True
        if email_clean in self._verified_emails:
            del self._verified_emails[email_clean]
        return False

    def consume_verified_email(self, email: str) -> None:
        """Consume verified status upon successful account creation."""
        email_clean = email.strip().lower()
        self._verified_emails.pop(email_clean, None)

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

        try:
            print(f"[EMAIL SERVICE] Connecting to SMTP server {self.smtp_host}:{self.smtp_port}...")
            server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=12)
            
            if self.use_tls:
                server.starttls()

            if self.smtp_user and self.smtp_password:
                server.login(self.smtp_user, self.smtp_password)

            server.sendmail(self.from_email, recipient_clean, msg.as_string())
            server.quit()
            
            print(f"[EMAIL SERVICE] Successfully dispatched verification email to {recipient_clean} (Code: {code})")
            return {"success": True, "message": f"Verification email sent to {recipient_clean}", "code": code}

        except Exception as e:
            print(f"[EMAIL SERVICE ERROR] Failed to send email via SMTP to {recipient_clean}: {e}")
            # Still keep code in memory so user can verify via preview/console in local environments
            return {
                "success": False,
                "error": str(e),
                "message": f"Could not dispatch email via SMTP ({e}). Development code available.",
                "code": code
            }

email_service = EmailService()
