"""
Task 2.3 — Password recovery flow
===================================
POST /auth/forgot-password  — verify user exists → OTP → Telegram
POST /auth/reset-password   — verify OTP → update password hash
"""

import logging

from fastapi import APIRouter, Depends, status

from core.config import get_settings
from core.exceptions import UserNotFoundError
from dependencies.services import get_otp_service, get_telegram_service, get_token_service
from schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from services.auth.otp_service import OTPService
from services.auth.telegram import TelegramService
from services.auth.token_service import TokenService

log = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def forgot_password(
    body: ForgotPasswordRequest,
    token_svc: TokenService = Depends(get_token_service),
    otp_svc: OTPService = Depends(get_otp_service),
    tg_svc: TelegramService = Depends(get_telegram_service),
) -> ForgotPasswordResponse:
    """
    Send a password-reset OTP to the user's Telegram account.

    Security: we return 202 regardless of whether the user exists —
    this prevents account enumeration by timing or response differences.
    The error is logged internally but never exposed to the caller.
    """
    try:
        await token_svc.get_user_by_tg(tg_username=body.tg_username)
    except UserNotFoundError:
        # Silent — don't reveal whether this tg_username is registered
        log.warning("forgot-password: unknown user @%s", body.tg_username)
        return ForgotPasswordResponse(bot_username=tg_svc.bot_username)

    code = otp_svc.generate()
    await otp_svc.save_otp(tg_username=body.tg_username, code=code)

    await tg_svc.send_message(
        tg_username=body.tg_username,
        text=(
            f"🔑 Your password reset code: <b>{code}</b>\n\n"
            f"Expires in 5 minutes. If you didn't request this, ignore this message."
        ),
    )

    log.info("Password reset OTP sent to @%s", body.tg_username)
    return ForgotPasswordResponse(bot_username=tg_svc.bot_username)


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
)
async def reset_password(
    body: ResetPasswordRequest,
    token_svc: TokenService = Depends(get_token_service),
    otp_svc: OTPService = Depends(get_otp_service),
) -> ResetPasswordResponse:
    """
    1. Validate the reset OTP from Redis.
    2. Hash the new password and update it in the DB (Developer 1 handles hashing).
    """
    # Raises OTPInvalidError / OTPNotFoundError on failure
    await otp_svc.verify_otp(tg_username=body.tg_username, code=body.code)

    await token_svc.update_password(
        tg_username=body.tg_username,
        new_password=body.new_password,
    )

    log.info("Password reset complete for @%s", body.tg_username)
    return ResetPasswordResponse()
