"""
All domain exceptions live here.

Each exception carries:
  error_code  — machine-readable string the frontend branches on
  status_code — HTTP status sent to the client
  message     — human-readable fallback text

The global handler in main.py converts these to JSON automatically,
so routers only raise — they never format error responses themselves.
"""


class AppError(Exception):
    """Base for every application-level error."""
    error_code: str = "INTERNAL_ERROR"
    status_code: int = 500
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None):
        self.message = message or self.__class__.message
        super().__init__(self.message)


# ── Telegram ──────────────────────────────────────────────────────────────────

class TelegramBotNotStartedError(AppError):
    """
    User has never pressed /start in the bot.
    Frontend should show: "Please start our bot: @<bot_username>"
    """
    error_code = "TELEGRAM_BOT_NOT_STARTED"
    status_code = 422
    message = "Please start our Telegram bot first."


class TelegramSendError(AppError):
    """Network timeout, rate-limit, or any other Telegram API failure."""
    error_code = "TELEGRAM_SEND_FAILED"
    status_code = 502
    message = "Failed to send Telegram message. Please try again."


# ── OTP ───────────────────────────────────────────────────────────────────────

class OTPNotFoundError(AppError):
    """No active OTP in Redis — either expired or never sent."""
    error_code = "OTP_NOT_FOUND"
    status_code = 422
    message = "No active verification code found. Please request a new one."


class OTPInvalidError(AppError):
    """OTP exists but the supplied value doesn't match."""
    error_code = "OTP_INVALID"
    status_code = 422
    message = "Invalid verification code."


# ── User / Auth ───────────────────────────────────────────────────────────────

class UserNotFoundError(AppError):
    error_code = "USER_NOT_FOUND"
    status_code = 404
    message = "User not found."


class UserAlreadyExistsError(AppError):
    error_code = "USER_ALREADY_EXISTS"
    status_code = 409
    message = "A user with this username or Telegram handle already exists."


class UserAlreadyActiveError(AppError):
    error_code = "USER_ALREADY_ACTIVE"
    status_code = 409
    message = "This account is already verified."


class UserInactiveError(AppError):
    error_code = "USER_INACTIVE"
    status_code = 403
    message = "Account is not yet verified."
