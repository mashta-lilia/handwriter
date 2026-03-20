import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from backend.core.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(env_path)


DATABASE_URL = settings.DATABASE_URL

if not DATABASE_URL:
    raise ValueError(f"DATABASE_URL не найден! Проверь файл {env_path}")

engine = create_async_engine(DATABASE_URL, echo=True, future=True, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})

async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()