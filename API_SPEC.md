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
4. **WebSocket** (Future): Consider WebSocket implementation for real-time message delivery
5. **Pagination** (Future): Add pagination for messages list when chat history grows large

---

## Example Integration (Frontend)

```typescript
// Login
const loginResponse = await fetch('http://localhost:8000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'john_doe' })
});

// Get Chats
const chatsResponse = await fetch(
  `http://localhost:8000/api/chats?userId=${userId}`,
  { headers: { 'Content-Type': 'application/json' } }
);

// Get Chat Details
const chatDetailsResponse = await fetch(
  `http://localhost:8000/api/chats/${chatId}`,
  { headers: { 'Content-Type': 'application/json' } }
);

// Send Message
const sendMessageResponse = await fetch(
  `http://localhost:8000/api/chats/${chatId}/messages`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello!', senderId: userId })
  }
);
```