from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class WebSocketMessage(BaseModel):
    type: str
    timestamp: datetime = None

    def __init__(self, **data):
        if 'timestamp' not in data or data['timestamp'] is None:
            data['timestamp'] = datetime.now()
        super().__init__(**data)


class NewMessageNotification(WebSocketMessage):
    type: Literal["new_message"] = "new_message"
    chatId: str
    message: dict


class ChatUpdateNotification(WebSocketMessage):
    type: Literal["chat_update"] = "chat_update"
    chatId: str
    lastMessage: str
    lastMessageTime: datetime
    unreadCount: Optional[int] = None


class UserTypingNotification(WebSocketMessage):
    type: Literal["user_typing"] = "user_typing"
    chatId: str
    userId: str
    username: str
    isTyping: bool


class SubscriptionMessage(BaseModel):
    action: Literal["subscribe", "unsubscribe"]
    chatId: str


class ConnectionAcknowledgment(WebSocketMessage):
    type: Literal["connected"] = "connected"
    userId: str
    message: str = "Successfully connected to WebSocket"


class ErrorMessage(WebSocketMessage):
    type: Literal["error"] = "error"
    error: str
    details: Optional[str] = None
