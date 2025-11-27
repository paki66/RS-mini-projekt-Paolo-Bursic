# WebSocket Real-Time Notifications Implementation

## Overview

This implementation adds real-time notifications to the chat application using WebSocket protocol. Users can receive instant updates when new messages are sent, chats are updated, or when other users are typing.

## Architecture

### Components

1. **WebSocket Manager** (`websocket_manager.py`)
   - Manages all active WebSocket connections
   - Handles user subscriptions to specific chats
   - Broadcasts notifications to subscribed users

2. **WebSocket Endpoint** (`api/websocket.py`)
   - WebSocket endpoint at `/api/ws`
   - Handles client connections, subscriptions, and typing indicators

3. **Notification Models** (`model/notification.py`)
   - Pydantic models for different notification types
   - Type-safe message structures

4. **Updated Messages API** (`api/messages.py`)
   - Integrated with WebSocket manager
   - Broadcasts new messages in real-time

## WebSocket Endpoint

### Connection URL

```
ws://localhost:8000/api/ws?userId={userId}
```

**Required Query Parameter:**
- `userId`: The unique identifier of the connecting user

### Connection Flow

1. Client connects with userId
2. Server accepts connection and sends acknowledgment:
```json
{
  "type": "connected",
  "userId": "user123",
  "message": "Successfully connected to WebSocket",
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

## Message Types

### 1. Client to Server Messages

#### Subscribe to Chat
```json
{
  "action": "subscribe",
  "chatId": "chat_1"
}
```

**Response:**
```json
{
  "type": "subscription_confirmed",
  "action": "subscribe",
  "chatId": "chat_1",
  "message": "Subscribed to chat chat_1"
}
```

#### Unsubscribe from Chat
```json
{
  "action": "unsubscribe",
  "chatId": "chat_1"
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "chatId": "chat_1",
  "isTyping": true
}
```

### 2. Server to Client Notifications

#### New Message Notification
Sent when a new message is posted to a subscribed chat:
```json
{
  "type": "new_message",
  "chatId": "chat_1",
  "message": {
    "id": "msg_abc123",
    "text": "Hello world!",
    "sender": "john_doe",
    "timestamp": "2025-11-27T10:00:00.000Z",
    "isOwnMessage": false
  },
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

#### Chat Update Notification
Sent when chat metadata changes:
```json
{
  "type": "chat_update",
  "chatId": "chat_1",
  "lastMessage": "Hello world!",
  "lastMessageTime": "2025-11-27T10:00:00.000Z",
  "unreadCount": 3,
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

#### User Typing Notification
Sent when another user is typing:
```json
{
  "type": "user_typing",
  "chatId": "chat_1",
  "userId": "user456",
  "username": "jane_doe",
  "isTyping": true,
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

#### Error Message
Sent when an error occurs:
```json
{
  "type": "error",
  "error": "Invalid JSON",
  "details": "Could not parse message as JSON",
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

## Usage Example (JavaScript)

```javascript
// Connect to WebSocket
const userId = 'user123';
const ws = new WebSocket(`ws://localhost:8000/api/ws?userId=${userId}`);

// Handle connection open
ws.onopen = () => {
  console.log('WebSocket connected');

  // Subscribe to a chat
  ws.send(JSON.stringify({
    action: 'subscribe',
    chatId: 'chat_1'
  }));
};

// Handle incoming messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.type) {
    case 'connected':
      console.log('Connection acknowledged:', data.message);
      break;

    case 'new_message':
      console.log('New message in chat', data.chatId, ':', data.message);
      // Update UI with new message
      break;

    case 'chat_update':
      console.log('Chat updated:', data);
      // Update chat list UI
      break;

    case 'user_typing':
      console.log(data.username, 'is typing in', data.chatId);
      // Show typing indicator
      break;

    case 'subscription_confirmed':
      console.log('Subscription confirmed:', data);
      break;

    case 'error':
      console.error('WebSocket error:', data.error, data.details);
      break;
  }
};

// Send typing indicator
function sendTypingIndicator(chatId, isTyping) {
  ws.send(JSON.stringify({
    type: 'typing',
    chatId: chatId,
    isTyping: isTyping
  }));
}

// Handle connection close
ws.onclose = () => {
  console.log('WebSocket disconnected');
};

// Handle errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## Features

### 1. Real-Time Message Delivery
- New messages are instantly broadcasted to all subscribed users
- Sender is excluded from receiving their own message notification
- Messages are delivered to all active connections of a user

### 2. Chat Subscriptions
- Users can subscribe to multiple chats simultaneously
- Only receive notifications for subscribed chats
- Automatic cleanup when user disconnects

### 3. Typing Indicators
- Users can send typing status to other chat participants
- Typing notifications are broadcasted to all other users in the chat
- Sender doesn't receive their own typing notification

### 4. Multiple Connections Support
- A single user can have multiple WebSocket connections (e.g., multiple browser tabs)
- Notifications are sent to all active connections
- Automatic cleanup of disconnected connections

### 5. Error Handling
- Invalid JSON messages are caught and reported
- Unknown message types trigger error notifications
- WebSocket disconnections are handled gracefully

## Testing the WebSocket

### Using Browser Console
```javascript
const ws = new WebSocket('ws://localhost:8000/api/ws?userId=testUser');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({action: 'subscribe', chatId: 'chat_1'}));
```

### Using Python Client
```python
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/api/ws?userId=testUser"
    async with websockets.connect(uri) as websocket:
        # Receive connection acknowledgment
        response = await websocket.recv()
        print(f"Connected: {response}")

        # Subscribe to chat
        await websocket.send(json.dumps({
            "action": "subscribe",
            "chatId": "chat_1"
        }))

        # Listen for messages
        while True:
            message = await websocket.recv()
            print(f"Received: {message}")

asyncio.run(test_websocket())
```

## Integration with Frontend

To integrate with your React frontend, you'll need to:

1. Create a WebSocket service in `frontend/my-app/src/services/websocket.ts`
2. Connect when user logs in
3. Subscribe to chats when they're opened
4. Handle incoming notifications to update UI
5. Send typing indicators when user types

## Next Steps

1. Implement WebSocket client in the frontend
2. Add unread count updates via WebSocket
3. Add user online/offline status notifications
4. Add message read receipts
5. Add file upload progress notifications

## Security Considerations

Current implementation:
- Requires userId in connection URL
- No authentication yet

Recommended improvements:
- Add JWT token authentication for WebSocket connections
- Validate user permissions before sending notifications
- Rate limiting for typing indicators
- Encrypt sensitive data in notifications