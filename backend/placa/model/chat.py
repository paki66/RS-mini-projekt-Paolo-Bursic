from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Chat(BaseModel):
    id: str
    name: str
    lastMessage: Optional[str] = None
    lastMessageTime: Optional[datetime] = None
    unreadCount: Optional[int] = 0


class ChatsResponse(BaseModel):
    success: bool
    chats: List[Chat]