from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from ..model.message import SendMessageRequest, SendMessageResponse, Message
from ..model.notification import NewMessageNotification, ChatUpdateNotification
from ..storage import chats_db, messages_db, users_db
from ..config.real_time.ws_manager import manager

router = APIRouter()


@router.post("/chats/{chatId}/messages", response_model=SendMessageResponse)
async def send_message(chatId: str, request: SendMessageRequest):
    if chatId not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")

    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message text is required")

    if len(request.text) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 characters)")

    sender_username = users_db.get(request.senderId, "Unknown")

    new_message = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "text": request.text,
        "sender": sender_username,
        "timestamp": datetime.now(),
        "isOwnMessage": True
    }

    if chatId not in messages_db:
        messages_db[chatId] = []
    messages_db[chatId].append(new_message)

    chats_db[chatId]["lastMessage"] = request.text
    chats_db[chatId]["lastMessageTime"] = new_message["timestamp"]

    new_message_notification = NewMessageNotification(
        chatId=chatId,
        message=new_message
    )
    await manager.broadcast_to_chat(
        new_message_notification.model_dump(mode='json'),
        chatId,
        exclude_user=request.senderId
    )

    chat_update_notification = ChatUpdateNotification(
        chatId=chatId,
        lastMessage=request.text,
        lastMessageTime=new_message["timestamp"]
    )
    await manager.broadcast_to_chat(
        chat_update_notification.model_dump(mode='json'),
        chatId,
        exclude_user=request.senderId
    )

    return SendMessageResponse(
        success=True,
        message=Message(**new_message)
    )
