from fastapi import APIRouter, HTTPException
from ..model.chat import Chat, ChatsResponse
from ..model.message import ChatDetailsResponse, Message
from ..storage import chats_db, messages_db

router = APIRouter()


@router.get("/chats", response_model=ChatsResponse)
async def get_chats(userId: str):
    """
    Get all chats for a user.
    In this implementation, returns all available chats.
    """
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
async def get_chat_details(chatId: str):
    """
    Get detailed information about a specific chat including all messages.
    """
    if chatId not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat = Chat(**chats_db[chatId])
    messages = messages_db.get(chatId, [])

    # Convert messages to Message objects
    message_objects = [Message(**msg) for msg in messages]

    return ChatDetailsResponse(
        success=True,
        chat=chat,
        messages=message_objects
    )