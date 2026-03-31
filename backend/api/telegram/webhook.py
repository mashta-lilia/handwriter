"""
Telegram Webhook
=================
POST /api/telegram/webhook

Telegram servers POST updates here. When a user sends /start,
we extract their username and numeric chat_id and store it in Redis.
This chat_id is later used by TelegramService.send_message() to
deliver OTP codes reliably.
"""

import logging

from fastapi import APIRouter, Depends, Request, status

from dependencies.services import get_telegram_service
from services.auth.telegram import TelegramService

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/telegram", tags=["telegram"])


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def telegram_webhook(
    request: Request,
    tg_svc: TelegramService = Depends(get_telegram_service),
) -> dict:
    """
    Receive updates from Telegram.
    On /start command — save the user's chat_id to Redis.
    """
    try:
        body = await request.json()
    except Exception:
        return {"ok": True}

    message = body.get("message", {})
    text = message.get("text", "")
    chat = message.get("chat", {})
    from_user = message.get("from", {})

    chat_id: int | None = chat.get("id")
    username: str | None = from_user.get("username")

    if text.startswith("/start") and chat_id and username:
        await tg_svc.save_chat_id(tg_username=username, chat_id=chat_id)
        log.info("Saved chat_id=%d for @%s via /start", chat_id, username)

    return {"ok": True}