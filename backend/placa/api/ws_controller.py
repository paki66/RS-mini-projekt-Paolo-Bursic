from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import json
from backend.placa.config.real_time.ws_manager import manager
from ..service.ws_service import (
    send_connection_acknowledgment,
    send_error,
    process_client_message
)

router = APIRouter()


async def handle_message_loop(websocket: WebSocket, user_id: str):
    while True:
        data = await websocket.receive_text()

        try:
            message_data = json.loads(data)
            await process_client_message(websocket, user_id, message_data)

        except json.JSONDecodeError:
            await send_error(websocket, "Invalid JSON", "Could not parse message as JSON")

        except Exception as e:
            await send_error(websocket, "Processing error", str(e))


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: Optional[str] = Query(None, alias="userId")
):
    if not user_id:
        await websocket.close(code=1008, reason="userId query parameter is required")
        return

    await manager.connect(websocket, user_id)

    await send_connection_acknowledgment(websocket, user_id)

    try:
        await handle_message_loop(websocket, user_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        print(f"Client {user_id} disconnected")

    except Exception as e:
        print(f"Error in WebSocket connection for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)