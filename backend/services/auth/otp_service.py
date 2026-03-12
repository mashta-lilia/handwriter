"""
Task 2.2 — OTP Service + Redis
================================
Generates cryptographically secure 6-digit codes and persists them
in Redis with a 5-minute TTL.

Redis key schema
----------------
    otp:<lowercase_username>  →  "<6-digit code>"
    TTL = settings.otp_ttl_seconds  (default 300 s)

Security notes
--------------
* secrets.randbelow() uses the OS CSPRNG — never math.random().
* verify_otp() uses secrets.compare_digest() to prevent timing attacks.
* The key is deleted on the first successful match — truly one-time.
* Failed attempts leave the key intact (user can retry until TTL expires).
  Add a strike counter here if brute-force protection is needed later.
"""

import logging
import secrets

from redis.asyncio import Redis

from core.config import get_settings
from core.exceptions import OTPInvalidError, OTPNotFoundError

log = logging.getLogger(__name__)
settings = get_settings()

_PREFIX = "otp"
_DIGITS = 6
_RANGE = 10 ** _DIGITS  # 1_000_000


def _key(tg_username: str) -> str:
    return f"{_PREFIX}:{tg_username.lstrip('@').lower()}"


class OTPService:

    def __init__(self, redis: Redis):
        self._redis = redis
        self._ttl = settings.otp_ttl_seconds

    def generate(self) -> str:
        """Return a zero-padded 6-digit CSPRNG string, e.g. '007341'."""
        return str(secrets.randbelow(_RANGE)).zfill(_DIGITS)

    async def save_otp(self, tg_username: str, code: str) -> None:
        """
        Persist *code* in Redis with a 5-minute TTL.
        Overwrites any existing code for the same user (handles resend).
        """
        await self._redis.set(_key(tg_username), code, ex=self._ttl)
        log.debug("OTP saved for %s (TTL=%ds)", tg_username, self._ttl)

    async def verify_otp(self, tg_username: str, code: str) -> None:
        """
        Validate *code* and delete it from Redis on success.

        Raises
        ------
        OTPNotFoundError  — no active OTP (expired or never sent)
        OTPInvalidError   — code exists but doesn't match
        """
        stored = await self._redis.get(_key(tg_username))

        if stored is None:
            log.warning("OTP not found for %s", tg_username)
            raise OTPNotFoundError()

        if not secrets.compare_digest(stored, code):
            log.warning("OTP mismatch for %s", tg_username)
            raise OTPInvalidError()

        await self._redis.delete(_key(tg_username))
        log.info("OTP verified and consumed for %s", tg_username)
