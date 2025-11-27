from .auth_controller import router as auth_router
from .chats_controller import router as chats_router
from .messages_controller import router as messages_router
from .ws_controller import router as websocket_router

__all__ = [
    "auth_router",
    "chats_router",
    "messages_router",
    "websocket_router",
]