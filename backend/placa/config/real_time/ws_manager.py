from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.chat_subscriptions: Dict[str, set] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = []

        self.active_connections[user_id].append(websocket)
        print(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                print(f"User {user_id} disconnected. Remaining connections: {len(self.active_connections[user_id])}")

            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                for chat_id in list(self.chat_subscriptions.keys()):
                    if user_id in self.chat_subscriptions[chat_id]:
                        self.chat_subscriptions[chat_id].remove(user_id)
                    if not self.chat_subscriptions[chat_id]:
                        del self.chat_subscriptions[chat_id]

    def subscribe_to_chat(self, user_id: str, chat_id: str):
        if chat_id not in self.chat_subscriptions:
            self.chat_subscriptions[chat_id] = set()

        self.chat_subscriptions[chat_id].add(user_id)
        print(f"User {user_id} subscribed to chat {chat_id}")

    def unsubscribe_from_chat(self, user_id: str, chat_id: str):
        if chat_id in self.chat_subscriptions:
            self.chat_subscriptions[chat_id].discard(user_id)
            if not self.chat_subscriptions[chat_id]:
                del self.chat_subscriptions[chat_id]
            print(f"User {user_id} unsubscribed from chat {chat_id}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message to {user_id}: {e}")
                    disconnected.append(connection)

            for conn in disconnected:
                self.disconnect(conn, user_id)

    async def broadcast_to_chat(self, message: dict, chat_id: str, exclude_user: str = None):
        if chat_id not in self.chat_subscriptions:
            return

        for user_id in self.chat_subscriptions[chat_id]:
            if exclude_user and user_id == exclude_user:
                continue

            await self.send_personal_message(message, user_id)

    async def broadcast_to_all(self, message: dict):
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)


manager = ConnectionManager()