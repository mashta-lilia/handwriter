from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from core.config import get_settings
from core.exceptions import AppError

settings = get_settings()

ALGORITHM = settings.jwt_algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class InvalidTokenError(AppError):
    error_code = "INVALID_TOKEN"
    status_code = 401
    message = "Invalid or expired token."


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_tokens(user_id: int) -> dict:
    """Returns both access and refresh tokens — main entry point."""
    return {
        "access_token": _create_access_token(user_id),
        "refresh_token": _create_refresh_token(user_id),
    }


def verify_access_token(token: str) -> int:
    """Decode token and return user_id. Raises InvalidTokenError on failure."""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise InvalidTokenError()
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise InvalidTokenError()


def _create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"exp": expire, "sub": str(user_id), "type": "access"},
        settings.jwt_secret_key,
        algorithm=ALGORITHM,
    )


def _create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    return jwt.encode(
        {"exp": expire, "sub": str(user_id), "type": "refresh"},
        settings.jwt_secret_key,
        algorithm=ALGORITHM,
    )