# Placa Backend

Real-time chat messaging API built with FastAPI.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **WebSockets** - Real-time bidirectional communication
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## Setup

1. Create the conda environment:
```bash
conda env create -f environment.yaml
```

2. Activate the environment:
```bash
conda activate RS-mini-projekt-Paolo-Bursic
```

3. Run the server:
```bash
uvicorn placa.main:placa --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Interactive API documentation is available when the server is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
placa/
├── api/              # API route controllers
├── config/           # Configuration (CORS, WebSocket)
├── model/            # Data models (User, Chat, Message, Notification)
├── service/          # Business logic
└── main.py           # Application entry point
```

### Package Descriptions

**`api/`** - Contains FastAPI route controllers that handle HTTP and WebSocket endpoints. Includes controllers for user authentication (`auth_controller.py`), chat management (`chats_controller.py`), message operations (`messages_controller.py`), and WebSocket connections (`ws_controller.py`). These controllers serve as the entry points for client requests and delegate business logic to the service layer.

**`config/`** - Houses application configuration modules. Contains CORS settings (`cors.py`) for cross-origin resource sharing and the `real_time/` sub-package for WebSocket infrastructure. This package centralizes configuration management to keep settings separate from business logic.

**`config/real_time/`** - Implements the WebSocket connection management system through the `ConnectionManager` class (`ws_manager.py`). Manages active WebSocket connections for each user, handles chat room subscriptions, and provides methods for broadcasting messages to specific chats or individual users. Acts as the core infrastructure for real-time communication.

**`model/`** - Defines Pydantic data models that ensure type safety and validation throughout the application. Includes models for users (`user.py`), chats (`chat.py`), messages (`message.py`), and real-time notifications (`notification.py`). These models handle data validation, serialization, and provide clear contracts for API requests and responses.

**`service/`** - Contains the business logic layer that processes WebSocket events and messages. The `ws_service.py` module handles subscription management, typing indicators, connection acknowledgments, and error messaging. This layer sits between the API controllers and the WebSocket manager, implementing the application's core real-time messaging functionality.