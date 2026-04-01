from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from core.exceptions import UserNotFoundError


async def get_user_by_tg(db: AsyncSession, tg_username: str) -> User:
    result = await db.execute(select(User).where(User.tg_username == tg_username))
    user = result.scalars().first()
    if not user:
        raise UserNotFoundError()
    return user


async def save_chat_id(db: AsyncSession, tg_username: str, chat_id: int) -> None:
    """Called when user presses /start in the bot — saves their chat_id."""
    result = await db.execute(select(User).where(User.tg_username == tg_username))
    user = result.scalars().first()
    if user:
        user.tg_chat_id = chat_id
        await db.commit()


async def get_chat_id(db: AsyncSession, tg_username: str) -> int | None:
    """Returns the stored chat_id for a given tg_username, or None."""
    result = await db.execute(select(User).where(User.tg_username == tg_username))
    user = result.scalars().first()
    return user.tg_chat_id if user else None


async def create_user(db: AsyncSession, username: str, hashed_password: str) -> User:
    new_user = User(tg_username=username, password_hash=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def activate_user(db: AsyncSession, tg_username: str) -> User:
    user = await get_user_by_tg(db, tg_username)
    user.is_active = True
    await db.commit()
    await db.refresh(user)
    return user


async def update_password(db: AsyncSession, tg_username: str, new_hash: str) -> None:
    user = await get_user_by_tg(db, tg_username)
    user.password_hash = new_hash
    await db.commit()
