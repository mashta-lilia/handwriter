"""
Task 2.3 — Registration flow
=============================
POST /auth/register          — create inactive user → OTP → Telegram
POST /auth/verify-registration — verify OTP → activate → return JWT pair
"""

import logging

from backend.core.exceptions import UserAlreadyExistsError
from fastapi import APIRouter, Depends, status

from core.config import get_settings
from dependencies.services import get_otp_service, get_telegram_service, get_token_service
from schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    TokenPairResponse,
    VerifyRegistrationRequest,
    VerifyRegistrationResponse,
)
from services.auth.otp_service import OTPService
from services.auth.telegram import TelegramService
from services.auth.token_service import TokenService

log = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def register(
    body: RegisterRequest,
    token_svc: TokenService = Depends(get_token_service),
    otp_svc: OTPService = Depends(get_otp_service),
    tg_svc: TelegramService = Depends(get_telegram_service),
) -> RegisterResponse:
    """
    1. Create an inactive user (Developer 1's TokenService).
    2. Generate OTP and store it in Redis with 5-min TTL.
    3. Send OTP to user's Telegram account.
       → If user never pressed /start, raises TelegramBotNotStartedError.
         The global error handler serialises this to:
         { "error_code": "TELEGRAM_BOT_NOT_STARTED",
           "message": "Please start our bot first: @<bot>",
           "bot_username": "<bot>" }
    """
    # Step 1 — create user, skip if already pending verification
    try:
        await token_svc.create_inactive_user(
            username=body.username,
            tg_username=body.tg_username,
            password=body.password,
        )
    except UserAlreadyExistsError:
        # User exists but is inactive — allow OTP resend
        user = await token_svc.get_user_by_tg(tg_username=body.tg_username)
        if user.is_active:
            raise  # genuinely duplicate — re-raise

    # Step 2 — generate and persist OTP
    code = otp_svc.generate()
    await otp_svc.save_otp(tg_username=body.tg_username, code=code)

    # Step 3 — deliver via Telegram
    await tg_svc.send_message(
        tg_username=body.tg_username,
        text=(
            f"👋 Your verification code: <b>{code}</b>\n\n"
            f"Expires in 5 minutes. Do not share it."
        ),
    )

    log.info("Registration OTP sent to @%s", body.tg_username)
    return RegisterResponse(bot_username=tg_svc.bot_username)


@router.post(
    "/verify-registration",
    response_model=VerifyRegistrationResponse,
    status_code=status.HTTP_200_OK,
)
async def verify_registration(
    body: VerifyRegistrationRequest,
    token_svc: TokenService = Depends(get_token_service),
    otp_svc: OTPService = Depends(get_otp_service),
) -> VerifyRegistrationResponse:
    """
    1. Validate OTP from Redis.
    2. Set user is_active=True in the DB.
    3. Issue JWT pair and return it to the frontend.
    """
    # Step 1 — raises OTPInvalidError / OTPNotFoundError on failure
    await otp_svc.verify_otp(tg_username=body.tg_username, code=body.code)

    # Step 2 — activate user
    user = await token_svc.activate_user(tg_username=body.tg_username)

    # Step 3 — issue JWT pair
    pair = await token_svc.create_tokens_for_user(user_id=user.id)

    log.info("User @%s verified and activated", body.tg_username)
    return VerifyRegistrationResponse(
        tokens=TokenPairResponse(
            access_token=pair.access_token,
            refresh_token=pair.refresh_token,
        )
    )
