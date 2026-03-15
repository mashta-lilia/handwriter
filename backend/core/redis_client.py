import redis.asyncio as aioredis
from redis.asyncio import Redis

from core.config import get_settings

settings = get_settings()

_pool: Redis | None = None


async def get_redis() -> Redis:
    """
    FastAPI dependency — returns a shared async Redis client.
    The pool is created on the first request and reused for the app lifetime.

    Usage in a route:
        async def my_route(redis: Redis = Depends(get_redis)): ...
    """
    global _pool
    if _pool is None:
        _pool = aioredis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password or None,
            db=settings.redis_db,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
    return _pool


async def close_redis() -> None:
    """Call this in the app shutdown lifespan hook."""
    global _pool
    if _pool:
        await _pool.aclose()
        _pool = None
