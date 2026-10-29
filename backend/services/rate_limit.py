"""
Tiny in-memory sliding-window rate limiter for abuse-prone endpoints
(login, OTP send/verify, password reset).

Per-process only: fine for a single Render instance. If you scale to several
workers/instances, move the counters to Redis.
"""

import time
import threading
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request, status


def client_ip(request: Request) -> str:
    """Best-effort client IP behind Render's proxy.

    Render appends the real client IP to X-Forwarded-For, so the LAST entry is the
    one set by the platform (earlier entries can be forged by the client).
    """
    xff = request.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


class RateLimiter:
    def __init__(self) -> None:
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: str, limit: int, window_seconds: int) -> None:
        """Record a hit; raise 429 if more than `limit` hits occurred in the window."""
        now = time.time()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > window_seconds:
                q.popleft()
            if len(q) >= limit:
                retry = max(1, int(window_seconds - (now - q[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many attempts. Try again in {retry} seconds.",
                    headers={"Retry-After": str(retry)},
                )
            q.append(now)
            # keep the table from growing forever
            if len(self._hits) > 20000:
                for k in [k for k, v in self._hits.items() if not v or now - v[-1] > window_seconds]:
                    self._hits.pop(k, None)


rate_limiter = RateLimiter()
