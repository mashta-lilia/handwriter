"""
dependencies/services.py
=========================
FastAPI Depends() factories for all services used by auth routers.

Why a separate file?
  Routers import from here, not directly from services/.
  This is the single place to swap real vs test implementations.

Usage:
    async def register(
        otp: OTPService = Depends(get_otp_service),
        tg:  TelegramService = Depends(get_telegram_service),
        tok: TokenService = Depends(get_token_service),
    ): ...
"""

from fastapi import Depends
from redis.asyncio import Redis

from core.redis_client import get_redis
from services.auth.otp_service import OTPService
from services.auth.telegram import TelegramService
from services.auth.token_service import TokenService


def get_otp_service(redis: Redis = Depends(get_redis)) -> OTPService:
    return OTPService(redis=redis)


def get_telegram_service() -> TelegramService:
    return TelegramService()


def get_token_service() -> TokenService:
    # When Developer 1 delivers their module, swap TokenService() here
    # with their real implementation, e.g. JWTTokenService(db=db)
    return TokenService()
