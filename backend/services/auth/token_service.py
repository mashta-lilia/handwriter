"""
token_service.py
=================
Interface contract for Developer 1's JWT logic.

Developer 2 calls two methods from this service:
  - create_tokens_for_user(user_id)  → TokenPair
  - get_user_by_tg(tg_username)      → UserRecord

Replace the stub bodies with the real implementations once
Developer 1 delivers their module.  Nothing else in this codebase
needs to change — all wiring goes through dependencies/services.py.
"""
from __future__ import annotations
from dataclasses import dataclass


@dataclass
class TokenPair:
    access_token: str
    refresh_token: str


@dataclass
class UserRecord:
    id: int
    username: str
    tg_username: str
    hashed_password: str
    is_active: bool


class TokenService:
    """
    Owns JWT issuance and user lookups.
    Developer 1 fills in the method bodies.
    """

    async def create_tokens_for_user(self, user_id: int) -> TokenPair:
        """Issue an access + refresh JWT pair for the given user id."""
        raise NotImplementedError("Developer 1: implement create_tokens_for_user")

    async def create_inactive_user(
        self,
        username: str,
        tg_username: str,
        password: str,
    ) -> UserRecord:
        """
        Hash *password* and insert a user row with is_active=False.
        Raise UserAlreadyExistsError if username or tg_username is taken.
        """
        raise NotImplementedError("Developer 1: implement create_inactive_user")

    async def activate_user(self, tg_username: str) -> UserRecord:
        """Set is_active=True. Raise UserNotFoundError if user doesn't exist."""
        raise NotImplementedError("Developer 1: implement activate_user")

    async def get_user_by_tg(self, tg_username: str) -> UserRecord:
        """Fetch any user by Telegram username. Raise UserNotFoundError if missing."""
        raise NotImplementedError("Developer 1: implement get_user_by_tg")

    async def update_password(self, tg_username: str, new_password: str) -> None:
        """Hash *new_password* and persist it. Raise UserNotFoundError if missing."""
        raise NotImplementedError("Developer 1: implement update_password")
