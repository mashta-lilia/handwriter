from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.api.auth.models import User

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.tg_username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, username: str, hashed_password: str):
    new_user = User(tg_username=username, password_hash=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user