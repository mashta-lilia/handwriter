from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from core.database import get_db
from models.user import User
import api.auth.crud as crud
from api.auth.security import (
    hash_password, generate_tokens, verify_password
)
from dataclasses import dataclass
from core.exceptions import UserAlreadyExistsError, UserNotFoundError, UserInactiveError
@dataclass
class TokenPair:
    access_token: str
    refresh_token: str

class TokenService:
    def __init__(self, db: AsyncSession):
        self._db = db

    async def create_inactive_user(self, username: str, tg_username: str, password: str) -> User:
        try:
            existing = await crud.get_user_by_tg(self._db, tg_username)
            raise UserAlreadyExistsError()  # user found → duplicate
        except UserNotFoundError:
            pass  # user doesn't exist → safe to create
        return await crud.create_user(self._db, tg_username, hash_password(password))

    async def activate_user(self, tg_username: str) -> User:
        return await crud.activate_user(self._db, tg_username)

    async def get_user_by_tg(self, tg_username: str) -> User:
        return await crud.get_user_by_tg(self._db, tg_username)

    async def update_password(self, tg_username: str, new_password: str) -> None:
        await crud.update_password(self._db, tg_username, hash_password(new_password))

    async def create_tokens_for_user(self, user_id: int) -> TokenPair:
        tokens = generate_tokens(user_id)
        return TokenPair(**tokens)