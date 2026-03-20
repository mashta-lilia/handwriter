import re
from pydantic import BaseModel, Field, field_validator


# ── Shared ────────────────────────────────────────────────────────────────────

def _clean_tg(v: str) -> str:
    v = v.strip().lstrip("@")
    if not re.match(r"^[a-zA-Z0-9_]{5,32}$", v):
        raise ValueError(
            "Telegram username must be 5–32 characters: letters, digits, underscores only."
        )
    return v


# ── Register ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    tg_username: str = Field(..., description="Telegram @username")
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("tg_username")
    @classmethod
    def validate_tg(cls, v: str) -> str:
        return _clean_tg(v)


class RegisterResponse(BaseModel):
    message: str = "Registration started. Check your Telegram for a verification code."
    bot_username: str


class VerifyRegistrationRequest(BaseModel):
    tg_username: str
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")

    @field_validator("tg_username")
    @classmethod
    def validate_tg(cls, v: str) -> str:
        return _clean_tg(v)


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class VerifyRegistrationResponse(BaseModel):
    message: str = "Account verified. Welcome!"
    tokens: TokenPairResponse


# ── Password recovery ─────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    tg_username: str

    @field_validator("tg_username")
    @classmethod
    def validate_tg(cls, v: str) -> str:
        return _clean_tg(v)


class ForgotPasswordResponse(BaseModel):
    message: str = "A verification code has been sent to your Telegram."
    bot_username: str


class ResetPasswordRequest(BaseModel):
    tg_username: str
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("tg_username")
    @classmethod
    def validate_tg(cls, v: str) -> str:
        return _clean_tg(v)


class ResetPasswordResponse(BaseModel):
    message: str = "Password updated. Please log in."


# ── Error envelope (frontend-facing) ─────────────────────────────────────────

class ErrorResponse(BaseModel):
    error_code: str
    message: str
    bot_username: str | None = None  # only set for TELEGRAM_BOT_NOT_STARTED
