"""
Telegram Bot API Integration
==============================
Wraps the Bot API sendMessage call.

IMPORTANT: Telegram bots cannot send by @username reliably.
Instead we store the numeric chat_id in Redis when the user
presses /start, then look it up here before sending.

Redis key schema:
    tg_chat_id:<lowercase_username>  →  "<numeric_chat_id>"
"""

import logging
import httpx

from redis.asyncio import Redis

from core.config import get_settings
from core.exceptions import TelegramBotNotStartedError, TelegramSendError

log = logging.getLogger(__name__)
settings = get_settings()

_API_BASE = "https://api.telegram.org/bot{token}/{method}"
_CHAT_ID_PREFIX = "tg_chat_id"


def _chat_id_key(tg_username: str) -> str:
    return f"{_CHAT_ID_PREFIX}:{tg_username.lstrip('@').lower()}"


class TelegramService:

    def __init__(
        self,
        redis: Redis,
        token: str | None = None,
        bot_username: str | None = None,
    ):
        self._redis = redis
        self._token = token or settings.telegram_bot_token
        self._bot_username = bot_username or settings.telegram_bot_username
        self._base = _API_BASE.format(token=self._token, method="{method}")

    # ── Public ────────────────────────────────────────────────────────────────

    async def save_chat_id(self, tg_username: str, chat_id: int) -> None:
        """Store numeric chat_id for a username when user presses /start."""
        await self._redis.set(_chat_id_key(tg_username), str(chat_id))
        log.info("Saved chat_id=%d for @%s", chat_id, tg_username)

    async def send_message(self, tg_username: str, text: str) -> None:
        """
        Send *text* to *tg_username* via the Telegram Bot API.
        Looks up the numeric chat_id from Redis first.

        Raises
        ------
        TelegramBotNotStartedError
            User never pressed /start — no chat_id in Redis.
        TelegramSendError
            Any other delivery failure.
        """
        stored = await self._redis.get(_chat_id_key(tg_username))
        if stored is None:
            log.warning("No chat_id found for @%s — user never pressed /start", tg_username)
            raise TelegramBotNotStartedError(
                f"Please start our bot first: @{self._bot_username}"
            )

        chat_id = int(stored)
        url = self._base.format(method="sendMessage")
        payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
        except httpx.TimeoutException as exc:
            log.error("Telegram timeout for %s: %s", tg_username, exc)
            raise TelegramSendError("Telegram API timed out. Try again later.") from exc
        except httpx.RequestError as exc:
            log.error("Telegram network error for %s: %s", tg_username, exc)
            raise TelegramSendError("Could not reach Telegram. Try again later.") from exc

        self._check_response(resp, tg_username)
        log.info("Telegram message delivered to @%s (chat_id=%d)", tg_username, chat_id)

    @property
    def bot_username(self) -> str:
        return self._bot_username

    # ── Private ───────────────────────────────────────────────────────────────

    def _check_response(self, resp: httpx.Response, tg_username: str) -> None:
        try:
            data = resp.json()
        except Exception:
            raise TelegramSendError("Unexpected response from Telegram API.")

        if data.get("ok"):
            return

        error_code: int = data.get("error_code", 0)
        description: str = data.get("description", "").lower()

        log.warning(
            "Telegram API error for %s — code=%s desc=%r",
            tg_username, error_code, description,
        )

        if error_code == 403 or (error_code == 400 and "chat not found" in description):
            raise TelegramBotNotStartedError(
                f"Please start our bot first: @{self._bot_username}"
            )

        raise TelegramSendError(
            f"Telegram error {error_code}: {data.get('description', '')}"
        )
