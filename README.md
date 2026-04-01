# HANDWRITTER

> Convert typed text into realistic handwritten notes — powered by AI.

---

## What is this?

Handwritter is a web application that takes any typed text and converts it into a realistic handwritten document. Users can customize the handwriting style, pen color, paper background, and various effects like letter tilt, sloppiness, and spacing. The final result can be downloaded as PNG or PDF.

---

## Tech Stack

### Frontend
- **React + TypeScript** — UI framework
- **Vite** — build tool
- **Tailwind CSS** — styling (custom cyberpunk design system)
- **React Router** — client-side routing
- **Tiptap** — rich text editor
- **Radix UI** — accessible modal/dialog primitives
- **Zustand** — global auth state (`authStore`)

### Backend
- **FastAPI** — Python web framework
- **SQLAlchemy (async)** — ORM
- **Redis** — OTP code storage (5-minute TTL)
- **JWT** — authentication (access + refresh tokens)
- **Telegram Bot API** — OTP delivery via Telegram DM
- **Nginx** — reverse proxy (production)

---

## Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── VerifyRegistrationPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── EditorPage.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── PasswordInput.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── RichEditor.tsx
│   │   │   └── canvas/
│   │   │       └── HandwritingCanvas.tsx
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│
└── backend/
    ├── api/auth/
    │   ├── register.py       — registration + OTP flow
    │   ├── recovery.py       — forgot/reset password
    │   ├── crud.py           — DB queries
    │   └── security.py       — JWT + bcrypt
    ├── services/auth/
    │   ├── otp_service.py    — OTP generation + Redis
    │   ├── telegram.py       — Telegram Bot API
    │   └── token_service.py  — user creation + token issuance
    ├── schemas/
    │   └── auth.py           — Pydantic request/response models
    ├── dependencies/
    │   └── services.py       — FastAPI Depends() factories
    └── core/
        ├── config.py
        ├── database.py
        ├── redis_client.py
        └── exceptions.py
```

---

## Auth Flow

Handwritter uses **Telegram OTP** for identity verification. No email required.

### Registration
1. User submits `username`, `tg_username`, `password` → `POST /api/auth/register`
2. Backend creates an inactive user and sends a 6-digit OTP to the user's Telegram DM
3. User enters the OTP → `POST /api/auth/verify-registration`
4. On success, account is activated and JWT tokens are returned

> ⚠️ The user must start the Telegram bot (`/start`) before registration — otherwise the OTP cannot be delivered.

### Login
- `POST /api/auth/login` with `tg_username` + `password`
- Returns `access_token` and `refresh_token` in the response body
- Frontend stores tokens in `localStorage`

### Password Reset
1. `POST /api/auth/forgot-password` — sends OTP to Telegram (always returns 202, even if user not found, to prevent account enumeration)
2. `POST /api/auth/reset-password` — validates OTP and updates password hash

---

## API Reference

Base URL: `/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Start registration, send OTP |
| POST | `/auth/verify-registration` | ❌ | Verify OTP, activate account |
| POST | `/auth/login` | ❌ | Login, get tokens |
| POST | `/auth/forgot-password` | ❌ | Send password reset OTP |
| POST | `/auth/reset-password` | ❌ | Reset password with OTP |
| GET | `/editor/settings` | ✅ | Get background and color options |
| POST | `/generate` | ✅ | Start handwriting generation job |
| GET | `/generate/stream?task_id=` | ✅ | SSE stream for generation progress |
| GET | `/documents` | ✅ | List user's saved documents |
| GET | `/documents/:id` | ✅ | Get a specific document (canvas schema) |
| POST | `/telegram/webhook` | ❌ | Telegram bot webhook receiver |

All protected routes require: `Authorization: Bearer <access_token>`

All errors follow this format:
```json
{
  "error_code": "ERROR_CODE_STRING",
  "message": "Human-readable message",
  "bot_username": null
}
```

---

## Generation Flow (SSE)

Generation is asynchronous and uses Server-Sent Events for real-time progress.

```
POST /api/generate  →  { task_id: "task_9f8b" }
        ↓
GET /api/generate/stream?task_id=task_9f8b
        ↓
event: progress  →  { progress: 10, status: "Analyzing text..." }
event: progress  →  { progress: 100, status: "Done" }
event: done      →  { result: [ ...Canvas Schema... ] }
```

The `result` array contains word objects with position, angle, and image URL for each word — rendered on the canvas via Fabric.js.

---

## Canvas Schema

The final output is an array of word objects:

```json
[
  {
    "id": "word_1",
    "word": "Hello,",
    "image_url": "https://storage.domain.com/words/abcd123.png",
    "x": 120.5,
    "y": 45.0,
    "angle": -2.1,
    "width": 85.0,
    "height": 30.0
  }
]
```

---

## Environment Variables

### Backend
```env
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/dbname

OTP_TTL_SECONDS=300
```

### Frontend
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run Redis (required for OTP)
docker run -d -p 6379:6379 redis

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Telegram Bot Setup
1. Create a bot via [@BotFather](https://t.me/BotFather) and get the token
2. Set the webhook to point to your backend:
```
https://yourdomain.com/api/telegram/webhook
```
3. Users must send `/start` to the bot before they can receive OTP codes

---

## Routing (Frontend)

| Path | Page | Protected |
|------|------|-----------|
| `/` | Redirects to `/login` | ❌ |
| `/login` | Login | ❌ |
| `/register` | Register | ❌ |
| `/verify-registration` | OTP verification | ❌ |
| `/forgot-password` | Password reset flow | ❌ |
| `/editor` | Handwriting editor | ✅ |

---

## Security Notes

- OTP codes are generated using `secrets.randbelow()` (OS CSPRNG — not `math.random()`)
- OTP verification uses `secrets.compare_digest()` to prevent timing attacks
- OTPs are deleted from Redis immediately after successful verification (truly one-time)
- The `/forgot-password` endpoint always returns 202 regardless of whether the user exists — prevents account enumeration
- Passwords are hashed with bcrypt via `passlib`
- JWT tokens are signed with HS256

---

## Known Pending Work

- [ ] `VerifyRegistrationPage.tsx` — needs to be created
- [ ] Token refresh logic — frontend interceptor for 401 responses not yet implemented
- [ ] `GET /auth/me` — session restore on page reload not yet connected
- [ ] `POST /auth/logout` — not yet implemented on backend
- [ ] `addImage()` and `addFormula()` in RichEditor use `window.prompt()` — should be replaced with a modal UI
- [ ] EditorPage Generate button — currently uses a fake timer, needs real SSE integration
