# Backend — Auth Service

Authentication service built with FastAPI. Handles user registration and password recovery via Telegram OTP verification.

**Developer 2 scope:** Telegram Bot API integration · Redis OTP storage · `/auth/*` endpoints  
**Developer 1 scope:** User model · password hashing · JWT issuance · database layer

---

## Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 + Uvicorn |
| OTP storage | Redis 7 |
| HTTP client | HTTPX (Telegram Bot API) |
| Database | PostgreSQL + SQLAlchemy (async) |
| Migrations | Alembic |
| Background tasks | ARQ |
| Validation | Pydantic v2 |

---

## Project structure

```
backend/
├── api/
│   └── auth/
│       ├── register.py       # POST /auth/register, /auth/verify-registration
│       └── recovery.py       # POST /auth/forgot-password, /auth/reset-password
├── core/
│   ├── config.py             # Settings loaded from .env
│   ├── exceptions.py         # All domain exceptions with error_code + status_code
│   └── redis_client.py       # Shared async Redis pool
├── dependencies/
│   ├── auth.py               # get_current_user, require_active_user guards
│   └── services.py           # Depends() factories for all services
├── models/                   # SQLAlchemy ORM models (Developer 1)
├── schemas/
│   └── auth.py               # Pydantic request/response schemas
├── services/
│   └── auth/
│       ├── telegram.py       # TelegramService — Bot API wrapper
│       ├── otp_service.py    # OTPService — generate / save / verify
│       └── token_service.py  # TokenService interface (Developer 1 fills in)
├── worker/
│   ├── tasks.py              # ARQ background task functions
│   └── settings.py           # ARQ WorkerSettings
├── main.py                   # App factory, global error handler, router registration
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

## Setup

### 1. Clone and configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in every value — see the [Environment variables](#environment-variables) section below.

### 2. Get a Telegram Bot token

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the token BotFather gives you into `TELEGRAM_BOT_TOKEN` in `.env`
4. Set `TELEGRAM_BOT_USERNAME` to your bot's handle **without** the `@`

### 3. Start services with Docker

```bash
docker-compose up -d
```

This starts Redis and the backend together. Redis data is persisted in a named volume.

### 4. Run locally (without Docker)

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Start Redis separately (or use docker-compose up -d redis)
docker-compose up -d redis

# Start the server
uvicorn main:app --reload
```

API docs available at **http://localhost:8000/docs**

### 5. Run tests

```bash
pytest tests/ -v
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_HOST` | ✅ | Redis host (default: `localhost`) |
| `REDIS_PORT` | | Redis port (default: `6379`) |
| `REDIS_PASSWORD` | | Redis password, leave empty if none |
| `REDIS_DB` | | Redis database index (default: `0`) |
| `OTP_TTL_SECONDS` | | OTP expiry in seconds (default: `300`) |
| `TELEGRAM_BOT_TOKEN` | ✅ | Token from @BotFather |
| `TELEGRAM_BOT_USERNAME` | ✅ | Bot username without `@` |
| `JWT_SECRET_KEY` | ✅ | Secret for signing JWT tokens |
| `JWT_ALGORITHM` | | JWT algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | | Access token TTL (default: `30`) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | | Refresh token TTL (default: `7`) |

---

## API endpoints

### Registration

#### `POST /auth/register`
Creates an inactive user, generates a 6-digit OTP, and delivers it to the user's Telegram account.

**Request**
```json
{
  "username": "alice",
  "tg_username": "@alice_tg",
  "password": "securepassword"
}
```

**Response `202`**
```json
{
  "message": "Registration started. Check your Telegram for a verification code.",
  "bot_username": "YourProjectBot"
}
```

**Error — user hasn't started the bot `422`**
```json
{
  "error_code": "TELEGRAM_BOT_NOT_STARTED",
  "message": "Please start our bot first: @YourProjectBot",
  "bot_username": "YourProjectBot"
}
```

---

#### `POST /auth/verify-registration`
Verifies the OTP, activates the user account, and returns a JWT token pair.

**Request**
```json
{
  "tg_username": "@alice_tg",
  "code": "482910"
}
```

**Response `200`**
```json
{
  "message": "Account verified. Welcome!",
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer"
  }
}
```

---

### Password recovery

#### `POST /auth/forgot-password`
Sends a password-reset OTP to the user's Telegram account.

> Always returns `202` regardless of whether the account exists — this prevents username enumeration.

**Request**
```json
{
  "tg_username": "@alice_tg"
}
```

**Response `202`**
```json
{
  "message": "A verification code has been sent to your Telegram.",
  "bot_username": "YourProjectBot"
}
```

---

#### `POST /auth/reset-password`
Verifies the OTP and updates the user's password.

**Request**
```json
{
  "tg_username": "@alice_tg",
  "code": "193847",
  "new_password": "newSecurePassword"
}
```

**Response `200`**
```json
{
  "message": "Password updated. Please log in."
}
```

---

## Error codes reference

All errors follow this envelope:

```json
{
  "error_code": "STRING_CONSTANT",
  "message": "Human-readable description",
  "bot_username": "YourBot"
}
```

`bot_username` is only included for `TELEGRAM_BOT_NOT_STARTED`.

| `error_code` | HTTP | When |
|---|---|---|
| `TELEGRAM_BOT_NOT_STARTED` | 422 | User hasn't pressed /start in the bot |
| `TELEGRAM_SEND_FAILED` | 502 | Network error or Telegram API failure |
| `OTP_NOT_FOUND` | 422 | No active OTP — expired or never sent |
| `OTP_INVALID` | 422 | Wrong code entered |
| `USER_NOT_FOUND` | 404 | No matching user in the database |
| `USER_ALREADY_EXISTS` | 409 | Duplicate username or Telegram handle |
| `USER_ALREADY_ACTIVE` | 409 | Account already verified |
| `USER_INACTIVE` | 403 | Account exists but not yet verified |

---

## How OTP works

```
User submits /register
        │
        ▼
  Create inactive user in DB
        │
        ▼
  Generate 6-digit code (CSPRNG)
  Save to Redis: otp:<username> → code  (TTL 5 min)
        │
        ▼
  Send code via Telegram Bot API
        │
  ┌─────┴──────────────────────────────┐
  │ User never pressed /start in bot   │
  │ → 422 TELEGRAM_BOT_NOT_STARTED     │
  └────────────────────────────────────┘
        │ (success)
        ▼
  Return 202 → frontend prompts user to check Telegram

User submits /verify-registration
        │
        ▼
  Fetch otp:<username> from Redis
  Compare with submitted code (constant-time)
        │
  ┌─────┴─────────────────┐
  │ Mismatch / not found  │
  │ → 422 OTP_INVALID     │
  └───────────────────────┘
        │ (match)
        ▼
  Delete key from Redis (code is consumed)
  Set user is_active = True in DB
  Issue JWT access + refresh tokens
  Return 200 + token pair
```

---

## Integration with Developer 1

`services/auth/token_service.py` defines the interface contract. Every method raises `NotImplementedError` until Developer 1 implements the bodies.

When Developer 1 delivers their module, only **one line** in `dependencies/services.py` needs to change:

```python
# Before
def get_token_service() -> TokenService:
    return TokenService()

# After
def get_token_service() -> TokenService:
    return JWTTokenService(db=get_db())   # Developer 1's implementation
```

Methods Developer 1 must implement:

| Method | Description |
|---|---|
| `create_inactive_user(username, tg_username, password)` | Hash password, insert user with `is_active=False` |
| `activate_user(tg_username)` | Set `is_active=True`, return updated `UserRecord` |
| `get_user_by_tg(tg_username)` | Fetch user by Telegram handle |
| `update_password(tg_username, new_password)` | Hash and persist new password |
| `create_tokens_for_user(user_id)` | Issue JWT access + refresh pair |