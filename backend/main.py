"""
main.py — application entry point
====================================
Responsibilities:
  1. Global exception handler — converts every AppError subclass to
     a structured JSON ErrorResponse (error_code + message + optional bot_username).
  2. Lifespan hooks — closes the Redis pool on shutdown.
  3. Router registration.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from core.config import get_settings
from core.exceptions import AppError, TelegramBotNotStartedError
from core.redis_client import close_redis
from schemas.auth import ErrorResponse
from api.auth.register import router as register_router
from api.auth.recovery import router as recovery_router

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()


app = FastAPI(
    title="Backend — Auth Service",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Global error handler ──────────────────────────────────────────────────────

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """
    Single handler for every domain exception.

    For TELEGRAM_BOT_NOT_STARTED we also include bot_username so the
    frontend can render a deep-link button straight to the bot.
    """
    body = ErrorResponse(error_code=exc.error_code, message=exc.message)

    if isinstance(exc, TelegramBotNotStartedError):
        body.bot_username = settings.telegram_bot_username

    return JSONResponse(
        status_code=exc.status_code,
        content=body.model_dump(exclude_none=True),
    )


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(register_router)
app.include_router(recovery_router)


@app.get("/health", tags=["infra"])
async def health():
    return {"status": "ok"}
