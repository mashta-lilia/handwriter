
Looking at what was submitted vs what Task 1.1 actually requires — there are serious gaps.

---

**What was submitted:**
- `database.py` — DB connection setup
- `alembic/` — migration scaffolding (env.py, ini, mako template)

**What Task 1.1 requires:**
- ✅ DB connection — present
- ❌ User model with all 5 fields — **missing entirely**
- ❌ Actual migration file — **only templates, no real migration**
- ❌ CRUD operations — **missing entirely**

---

**Bugs in what was submitted:**

**1. Database URL is hardcoded — twice**

In `database.py`:
```python
# This loads .env...
load_dotenv(env_path)

# ...then ignores it completely
database_url = "postgresql://postgres:mypassword@localhost:5432/my_db_name"
```

And again hardcoded in `alembic.ini`:
```ini
sqlalchemy.url = postgresql://postgres:mypassword@localhost:5432/my_db_name
```

Real passwords committed to git is a security problem. Should be:
```python
database_url = os.getenv("DATABASE_URL")
```

**2. Sync engine conflicts with our async stack**

`database.py` uses `create_engine` (synchronous). Our entire backend uses `asyncpg` and async FastAPI. This will deadlock. It needs to be:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
```

**3. Deprecated import**
```python
# Old — deprecated in SQLAlchemy 1.4+
from sqlalchemy.ext.declarative import declarative_base

# Correct
from sqlalchemy.orm import DeclarativeBase
```

**4. `env.py` imports `settings` that doesn't exist yet**
```python
from backend.core.config import settings  # uses .DATABASE_URL
```
But `database.py` never uses `settings` — it hardcodes the URL. These two files are inconsistent with each other.

---

**What needs to be added before this is mergeable:**

`backend/models/user.py` — the entire point of this task:
```python
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, DateTime, func
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    tg_username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

`backend/services/user_crud.py` — also missing:
```python
async def create_inactive_user(...) -> User
async def get_user_by_tg(tg_username: str) -> User | None
async def update_password(tg_username: str, new_hash: str) -> User
async def activate_user(tg_username: str) -> User
```

And an actual generated migration file in `alembic/versions/` — right now only the template exists, no real migration has been generated.

---

**Summary for Developer 1:** The scaffolding is there but the core deliverables (model + CRUD) are missing, the async/sync mismatch will break integration with Developer 2's code, and credentials must not be hardcoded.
