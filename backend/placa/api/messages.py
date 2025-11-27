from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from ..model.message import SendMessageRequest, SendMessageResponse, Message
from ..storage import chats_db, messages_db, users_db

router = APIRouter()


@router.post("/chats/{chatId}/messages", response_model=SendMessageResponse)
async def send_message(chatId: str, request: SendMessageRequest):
    """
    Send a new message to a specific chat.
    """
    if chatId not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")

    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message text is required")

    if len(request.text) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 characters)")

    # Get sender username
    sender_username = users_db.get(request.senderId, "Unknown")

    # Create new message
    new_message = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "text": request.text,
        "sender": sender_username,
        "timestamp": datetime.now(),
        "isOwnMessage": True
    }

    # Add message to chat
    if chatId not in messages_db:
        messages_db[chatId] = []
    messages_db[chatId].append(new_message)

    # Update chat's last message
    chats_db[chatId]["lastMessage"] = request.text
    chats_db[chatId]["lastMessageTime"] = new_message["timestamp"]

    return SendMessageResponse(
        success=True,
        message=Message(**new_message)
    )