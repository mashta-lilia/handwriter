"""
Telegram Webhook
=================
POST /api/telegram/webhook  — receives updates from Telegram servers.

When a user presses /start, we save their chat_id to the DB so we can
send OTP messages to them later using chat_id instead of @username.
"""

import logging
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
import api.auth.crud as crud

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/telegram", tags=["telegram"])


@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    data = await request.json()
    message = data.get("message") or data.get("edited_message")

    if not message:
        return {"ok": True}

    text = message.get("text", "")
    chat_id = message["chat"]["id"]
    username = message["from"].get("username")

    if text.startswith("/start") and username:
        await crud.save_chat_id(db, tg_username=username, chat_id=chat_id)
        log.info("Saved chat_id=%s for @%s", chat_id, username)

    return {"ok": True}
