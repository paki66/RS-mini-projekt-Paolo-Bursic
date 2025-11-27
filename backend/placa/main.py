from fastapi import FastAPI
from fastapi.responses import FileResponse
from .config import setup_cors
from .api import auth_router, chats_router, messages_router, websocket_router
import os

placa = FastAPI(
    title="Chat API",
    description="A simple chat application API with real_time notifications",
    version="1.0.0"
)

setup_cors(placa)

placa.include_router(auth_router, prefix="/api", tags=["Authentication"])
placa.include_router(chats_router, prefix="/api", tags=["Chats"])
placa.include_router(messages_router, prefix="/api", tags=["Messages"])
placa.include_router(websocket_router, prefix="/api", tags=["WebSocket"])

@placa.get("/{full_path:path}")
async def serve_spa(full_path: str):
    frontend_dist = os.path.join(os.path.dirname(__file__), "../../frontend/my-app/dist")
    file_path = os.path.join(frontend_dist, full_path)

    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)

    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return {"error": "Frontend not built. Run 'npm run build' in frontend/my-app"}
