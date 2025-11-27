from fastapi import FastAPI
from .config import setup_cors
from .api import auth_router, chats_router, messages_router, websocket_router

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


@placa.get("/", tags=["Root"])
async def root():
    return {
        "message": "Chat API Server",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }
