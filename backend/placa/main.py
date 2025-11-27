from fastapi import FastAPI
from .config import setup_cors
from .api import auth_router, chats_router, messages_router

# Create FastAPI application
placa = FastAPI(
    title="Chat API",
    description="A simple chat application API",
    version="1.0.0"
)

# Configure CORS
setup_cors(placa)

# Include API routers
placa.include_router(auth_router, prefix="/api", tags=["Authentication"])
placa.include_router(chats_router, prefix="/api", tags=["Chats"])
placa.include_router(messages_router, prefix="/api", tags=["Messages"])


# Root endpoint
@placa.get("/", tags=["Root"])
async def root():
    """Root endpoint returning API information."""
    return {
        "message": "Chat API Server",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }