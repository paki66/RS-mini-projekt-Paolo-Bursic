from pydantic import BaseModel
from typing import List
from datetime import datetime
from .chat import Chat


class Message(BaseModel):
    id: str
    text: str
    sender: str
    timestamp: datetime
    isOwnMessage: bool


class SendMessageRequest(BaseModel):
    text: str
    senderId: str


class SendMessageResponse(BaseModel):
    success: bool
    message: Message


class ChatDetailsResponse(BaseModel):
    success: bool
    chat: Chat
    messages: List[Message]