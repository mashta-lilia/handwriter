"""
Task 2.1 — Telegram Bot API Integration
========================================
Wraps the Bot API sendMessage call and translates raw HTTP/API errors
into domain exceptions that routers convert to structured JSON.

Critical constraint
-------------------
Telegram bots cannot send the first message — the user must press /start
in the bot chat first. If they haven't, the API returns HTTP 403.
We surface this as TelegramBotNotStartedError (error_code = "TELEGRAM_BOT_NOT_STARTED")
so the frontend can display:
    "Please start our bot first: @<bot_username>"
"""

import logging
import httpx

from core.config import get_settings
from core.exceptions import TelegramBotNotStartedError, TelegramSendError

log = logging.getLogger(__name__)
settings = get_settings()

_API_BASE = "https://api.telegram.org/bot{token}/{method}"


class TelegramService:

    def __init__(
        self,
        token: str | None = None,
        bot_username: str | None = None,
    ):
        self._token = token or settings.telegram_bot_token
        self._bot_username = bot_username or settings.telegram_bot_username
        self._base = _API_BASE.format(token=self._token, method="{method}")

    # ── Public ────────────────────────────────────────────────────────────────

    async def send_message(self, tg_username: str, text: str) -> None:
        """
        Send *text* to *tg_username* via the Telegram Bot API.

        Raises
        ------
        TelegramBotNotStartedError
            User never pressed /start.  Frontend must prompt them.
        TelegramSendError
            Any other delivery failure (timeout, rate-limit, network).
        """
        chat_id = _normalise(tg_username)
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
        log.info("Telegram message delivered to %s", tg_username)

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

        # 403 = bot blocked / user never started it
        # 400 with "chat not found" = same root cause
        if error_code == 403 or (error_code == 400 and "chat not found" in description):
            raise TelegramBotNotStartedError(
                f"Please start our bot first: @{self._bot_username}"
            )

        raise TelegramSendError(
            f"Telegram error {error_code}: {data.get('description', '')}"
        )


def _normalise(username: str) -> str:
    """Ensure the username has a leading @ for use as a Telegram chat_id."""
    username = username.strip()
    return username if username.startswith("@") else f"@{username}"
