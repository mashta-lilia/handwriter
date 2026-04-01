"""
Registration flow
==================
POST /auth/register          — create inactive user → OTP → Telegram
POST /auth/verify-registration — verify OTP → activate → return JWT pair
POST /auth/login             — login with password
GET  /auth/me                — get current user from token
"""

import logging

from api.auth.security import verify_password, verify_access_token
from fastapi import APIRouter, Depends, status, HTTPException, Header
from core.exceptions import UserAlreadyExistsError, UserInactiveError

from core.config import get_settings
from dependencies.services import get_otp_service, get_telegram_service, get_token_service
from schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    TokenPairResponse,
    VerifyRegistrationRequest,
    VerifyRegistrationResponse,
    LoginRequest,
)
from services.auth.otp_service import OTPService
from services.auth.telegram import TelegramService
from services.auth.token_service import TokenService
from sqlalchemy import select
from models.user import User

log = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api/auth", tags=["auth"])


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
    try:
        await token_svc.create_inactive_user(
            username=body.username,
            tg_username=body.tg_username,
            password=body.password,
        )
    except UserAlreadyExistsError:
        user = await token_svc.get_user_by_tg(tg_username=body.tg_username)
        if user.is_active:
            raise

    code = otp_svc.generate()
    await otp_svc.save_otp(tg_username=body.tg_username, code=code)

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
    await otp_svc.verify_otp(tg_username=body.tg_username, code=body.code)
    user = await token_svc.activate_user(tg_username=body.tg_username)
    pair = await token_svc.create_tokens_for_user(user_id=user.id)

    log.info("User @%s verified and activated", body.tg_username)
    return VerifyRegistrationResponse(
        tokens=TokenPairResponse(
            access_token=pair.access_token,
            refresh_token=pair.refresh_token,
        )
    )


@router.post("/login")
async def login(
    body: LoginRequest,
    token_svc: TokenService = Depends(get_token_service),
):
    user = await token_svc.get_user_by_tg(tg_username=body.tg_username)
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise UserInactiveError()
    pair = await token_svc.create_tokens_for_user(user_id=user.id)
    return TokenPairResponse(
        access_token=pair.access_token,
        refresh_token=pair.refresh_token,
    )


@router.get("/me")
async def get_me(
    authorization: str = Header(...),
    token_svc: TokenService = Depends(get_token_service),
):
    """Return current user from JWT token. Used by frontend on page refresh."""
    token = authorization.replace("Bearer ", "")
    user_id = verify_access_token(token)
    result = await token_svc._db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user": {"id": user.id, "tg_username": user.tg_username}}