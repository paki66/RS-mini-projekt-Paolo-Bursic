# Chat Application API Specification

**Base URL:** `http://localhost:8000/api`

**Version:** 1.0.0

**Content-Type:** `application/json`

---

## Endpoints

### 1. User Login

Authenticates a user with just a username.

**Endpoint:** `/login`
**Method:** `POST`
**Authentication:** None

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "username": "string (required, 1-50 characters)"
}
```

#### Response - Success (200 OK)
```json
{
  "success": true,
  "userId": "string (unique user identifier)",
  "username": "string (username that was provided)",
  "message": "string (optional success message)"
}
```

#### Response - Error (400 Bad Request)
```json
{
  "success": false,
  "message": "string (error description)"
}
```

#### Example Request
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'
```

#### Example Response
```json
{
  "success": true,
  "userId": "user_123456",
  "username": "john_doe"
}
```

---

### 2. Get User's Chats

Retrieves all chats for a specific user.

**Endpoint:** `/chats`
**Method:** `GET`
**Authentication:** Required (userId parameter)

#### Request Headers
```
Content-Type: application/json
```

#### Query Parameters
- `userId` (required): The unique identifier of the user

#### Response - Success (200 OK)
```json
{
  "success": true,
  "chats": [
    {
      "id": "string (unique chat identifier)",
      "name": "string (chat name)",
      "lastMessage": "string (optional, last message text)",
      "lastMessageTime": "string (optional, ISO 8601 datetime)",
      "unreadCount": "number (optional, count of unread messages)"
    }
  ]
}
```

#### Response - Error (400 Bad Request / 404 Not Found)
```json
{
  "success": false,
  "message": "string (error description)"
}
```

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/chats?userId=user_123456" \
  -H "Content-Type: application/json"
```

#### Example Response
```json
{
  "success": true,
  "chats": [
    {
      "id": "chat_1",
      "name": "General",
      "lastMessage": "Welcome to the chat!",
      "lastMessageTime": "2025-11-27T10:30:00Z",
      "unreadCount": 2
    },
    {
      "id": "chat_2",
      "name": "Tech Talk",
      "lastMessage": "Anyone using React?",
      "lastMessageTime": "2025-11-27T09:15:00Z",
      "unreadCount": 0
    }
  ]
}
```

---

### 3. Get Chat Details

Retrieves detailed information about a specific chat including all messages.

**Endpoint:** `/chats/:chatId`
**Method:** `GET`
**Authentication:** Required

#### Request Headers
```
Content-Type: application/json
```

#### URL Parameters
- `chatId` (required): The unique identifier of the chat

#### Response - Success (200 OK)
```json
{
  "success": true,
  "chat": {
    "id": "string (unique chat identifier)",
    "name": "string (chat name)",
    "lastMessage": "string (optional)",
    "lastMessageTime": "string (optional, ISO 8601 datetime)",
    "unreadCount": "number (optional)"
  },
  "messages": [
    {
      "id": "string (unique message identifier)",
      "text": "string (message content)",
      "sender": "string (username of sender)",
      "timestamp": "string (ISO 8601 datetime)",
      "isOwnMessage": "boolean (true if sent by current user)"
    }
  ]
}
```

#### Response - Error (404 Not Found)
```json
{
  "success": false,
  "message": "string (error description)"
}
```

#### Example Request
```bash
curl -X GET http://localhost:8000/api/chats/chat_1 \
  -H "Content-Type: application/json"
```

#### Example Response
```json
{
  "success": true,
  "chat": {
    "id": "chat_1",
    "name": "General",
    "lastMessage": "Hello everyone!",
    "lastMessageTime": "2025-11-27T10:30:00Z",
    "unreadCount": 0
  },
  "messages": [
    {
      "id": "msg_1",
      "text": "Welcome to the chat!",
      "sender": "admin",
      "timestamp": "2025-11-27T10:00:00Z",
      "isOwnMessage": false
    },
    {
      "id": "msg_2",
      "text": "Hello everyone!",
      "sender": "john_doe",
      "timestamp": "2025-11-27T10:30:00Z",
      "isOwnMessage": true
    }
  ]
}
```

---

### 4. Send Message

Sends a new message to a specific chat.

**Endpoint:** `/chats/:chatId/messages`
**Method:** `POST`
**Authentication:** Required

#### Request Headers
```
Content-Type: application/json
```

#### URL Parameters
- `chatId` (required): The unique identifier of the chat

#### Request Body
```json
{
  "text": "string (required, message content, 1-1000 characters)",
  "senderId": "string (required, user ID of sender)"
}
```

#### Response - Success (201 Created)
```json
{
  "success": true,
  "message": {
    "id": "string (unique message identifier)",
    "text": "string (message content)",
    "sender": "string (username of sender)",
    "timestamp": "string (ISO 8601 datetime)",
    "isOwnMessage": "boolean (true)"
  }
}
```

#### Response - Error (400 Bad Request / 404 Not Found)
```json
{
  "success": false,
  "message": "string (error description)"
}
```

#### Example Request
```bash
curl -X POST http://localhost:8000/api/chats/chat_1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello everyone!",
    "senderId": "user_123456"
  }'
```

#### Example Response
```json
{
  "success": true,
  "message": {
    "id": "msg_123",
    "text": "Hello everyone!",
    "sender": "john_doe",
    "timestamp": "2025-11-27T10:45:00Z",
    "isOwnMessage": true
  }
}
```

---

### 5. WebSocket Connection

Real-time bidirectional communication for instant message delivery and typing indicators.

**Endpoint:** `/ws`
**Protocol:** WebSocket
**Authentication:** Required (userId query parameter)

#### Connection URL
```
ws://localhost:8000/api/ws?userId={userId}
```

#### Query Parameters
- `userId` (required): The unique identifier of the user

#### Connection Flow

1. Client connects with userId query parameter
2. Server accepts connection and sends acknowledgment
3. Client subscribes to chats
4. Client and server exchange messages bidirectionally
5. Client disconnects or connection is closed

#### Client to Server Messages

##### Subscribe to Chat
```json
{
  "action": "subscribe",
  "chatId": "string"
}
```

**Response:**
```json
{
  "type": "subscription_confirmed",
  "action": "subscribe",
  "chatId": "string",
  "message": "Subscribed to chat {chatId}"
}
```

##### Unsubscribe from Chat
```json
{
  "action": "unsubscribe",
  "chatId": "string"
}
```

**Response:**
```json
{
  "type": "subscription_confirmed",
  "action": "unsubscribe",
  "chatId": "string",
  "message": "Unsubscribed from chat {chatId}"
}
```

##### Typing Indicator
```json
{
  "type": "typing",
  "chatId": "string",
  "isTyping": true
}
```

#### Server to Client Messages

##### Connection Acknowledgment
Sent immediately after successful connection.

```json
{
  "type": "connected",
  "userId": "string",
  "message": "Successfully connected to WebSocket",
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

##### New Message Notification
Sent when a new message is posted to a subscribed chat.

```json
{
  "type": "new_message",
  "chatId": "string",
  "message": {
    "id": "string",
    "text": "string",
    "sender": "string",
    "timestamp": "2025-11-27T10:00:00.000Z",
    "isOwnMessage": false
  },
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

##### Chat Update Notification
Sent when chat metadata is updated.

```json
{
  "type": "chat_update",
  "chatId": "string",
  "lastMessage": "string",
  "lastMessageTime": "2025-11-27T10:00:00.000Z",
  "unreadCount": 0,
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

##### User Typing Notification
Sent when another user is typing in a subscribed chat.

```json
{
  "type": "user_typing",
  "chatId": "string",
  "userId": "string",
  "username": "string",
  "isTyping": true,
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

##### Error Message
Sent when an error occurs.

```json
{
  "type": "error",
  "error": "string",
  "details": "string",
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

---

## Data Models

### User
```typescript
{
  userId: string;      // Unique identifier
  username: string;    // Display name
}
```

### Chat
```typescript
{
  id: string;                 // Unique identifier
  name: string;               // Chat room name
  lastMessage?: string;       // Last message text (optional)
  lastMessageTime?: Date;     // ISO 8601 datetime (optional)
  unreadCount?: number;       // Number of unread messages (optional)
}
```

### Message
```typescript
{
  id: string;           // Unique identifier
  text: string;         // Message content
  sender: string;       // Username of sender
  timestamp: Date;      // ISO 8601 datetime
  isOwnMessage: boolean; // True if sent by current user
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "string (human-readable error description)"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters or body
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Notes

1. **Timestamps**: All timestamps should be in ISO 8601 format (e.g., `2025-11-27T10:30:00Z`)
2. **Authentication**: Currently using userId for authentication. In production, implement proper JWT or session-based authentication.
3. **CORS**: Backend should allow CORS from frontend origin (e.g., `http://localhost:5173`)
4. **WebSocket**: WebSocket is implemented for real-time message delivery, chat updates, and typing indicators
5. **Pagination** (Future): Add pagination for messages list when chat history grows large
6. **WebSocket Reconnection**: Frontend should implement automatic reconnection logic for WebSocket connections
7. **Message Delivery**: Messages sent via REST API are automatically broadcasted to all subscribed users via WebSocket

---
