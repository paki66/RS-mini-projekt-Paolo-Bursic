from fastapi import WebSocket
from typing import Dict, Any
from ..config.real_time.ws_manager import manager
from ..model.notification import (
    ConnectionAcknowledgment,
    ErrorMessage,
    SubscriptionMessage,
    UserTypingNotification
)
from ..storage import users_db


async def send_connection_acknowledgment(websocket: WebSocket, user_id: str):
    ack = ConnectionAcknowledgment(userId=user_id)
    await websocket.send_json(ack.model_dump(mode='json'))


async def send_error(websocket: WebSocket, error_msg: str, details: str = None):
    error = ErrorMessage(error=error_msg, details=details)
    await websocket.send_json(error.model_dump(mode='json'))


async def handle_subscribe_action(websocket: WebSocket, user_id: str, chat_id: str):
    manager.subscribe_to_chat(user_id, chat_id)
    response = {
        "type": "subscription_confirmed",
        "action": "subscribe",
        "chatId": chat_id,
        "message": f"Subscribed to chat {chat_id}"
    }
    await websocket.send_json(response)


async def handle_unsubscribe_action(websocket: WebSocket, user_id: str, chat_id: str):
    manager.unsubscribe_from_chat(user_id, chat_id)
    response = {
        "type": "subscription_confirmed",
        "action": "unsubscribe",
        "chatId": chat_id,
        "message": f"Unsubscribed from chat {chat_id}"
    }
    await websocket.send_json(response)


async def handle_subscription_message(websocket: WebSocket, user_id: str, message_data: Dict[str, Any]):
    subscription = SubscriptionMessage(**message_data)

    if subscription.action == "subscribe":
        await handle_subscribe_action(websocket, user_id, subscription.chatId)
    elif subscription.action == "unsubscribe":
        await handle_unsubscribe_action(websocket, user_id, subscription.chatId)


async def handle_typing_indicator(user_id: str, message_data: Dict[str, Any]):
    chat_id = message_data.get("chatId")
    is_typing = message_data.get("isTyping", True)
    username = users_db.get(user_id, "Unknown")

    if chat_id:
        typing_notification = UserTypingNotification(
            chatId=chat_id,
            userId=user_id,
            username=username,
            isTyping=is_typing
        )

        await manager.broadcast_to_chat(
            typing_notification.model_dump(mode='json'),
            chat_id,
            exclude_user=user_id
        )


async def process_client_message(websocket: WebSocket, user_id: str, message_data: Dict[str, Any]):
    if "action" in message_data and "chatId" in message_data:
        await handle_subscription_message(websocket, user_id, message_data)

    elif message_data.get("type") == "typing":
        await handle_typing_indicator(user_id, message_data)

    else:
        await send_error(websocket, "Unknown message type", f"Received: {message_data}")