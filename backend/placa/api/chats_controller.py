from fastapi import APIRouter, HTTPException
from ..model.chat import Chat, ChatsResponse
from ..model.message import ChatDetailsResponse, Message
from ..storage import chats_db, messages_db

router = APIRouter()


@router.get("/chats", response_model=ChatsResponse)
async def get_chats(userId: str):
    if not userId:
        raise HTTPException(status_code=400, detail="userId is required")

    # In a real app, filter chats by user
    # For now, return all chats
    chats = [Chat(**chat_data) for chat_data in chats_db.values()]

    return ChatsResponse(
        success=True,
        chats=chats
    )


@router.get("/chats/{chatId}", response_model=ChatDetailsResponse)
async def get_chat_details(chatId: str, userId: str = None):
    if chatId not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat = Chat(**chats_db[chatId])
    messages = messages_db.get(chatId, [])

    message_objects = []
    for msg in messages:
        msg_copy = msg.copy()
        msg_copy["isOwnMessage"] = userId and msg.get("senderId") == userId
        message_objects.append(Message(**msg_copy))

    return ChatDetailsResponse(
        success=True,
        chat=chat,
        messages=message_objects
    )