from datetime import datetime, timedelta

# In-memory storage (dummy data)
users_db = {}  # userId -> username

chats_db = {
    "chat_1": {
        "id": "chat_1",
        "name": "General",
        "lastMessage": "Welcome to the general chat!",
        "lastMessageTime": datetime.now() - timedelta(minutes=5),
        "unreadCount": 0
    },
    "chat_2": {
        "id": "chat_2",
        "name": "Tech Talk",
        "lastMessage": "Anyone working on React projects?",
        "lastMessageTime": datetime.now() - timedelta(minutes=30),
        "unreadCount": 0
    },
    "chat_3": {
        "id": "chat_3",
        "name": "Random",
        "lastMessage": "Happy coding!",
        "lastMessageTime": datetime.now() - timedelta(hours=2),
        "unreadCount": 0
    }
}

messages_db = {
    "chat_1": [
        {
            "id": "msg_1_1",
            "text": "Welcome to the general chat!",
            "sender": "admin",
            "senderId": "admin_id",
            "timestamp": datetime.now() - timedelta(hours=1),
            "isOwnMessage": False
        },
        {
            "id": "msg_1_2",
            "text": "Thanks! Happy to be here.",
            "sender": "alice",
            "senderId": "alice_id",
            "timestamp": datetime.now() - timedelta(minutes=50),
            "isOwnMessage": False
        },
        {
            "id": "msg_1_3",
            "text": "Hello everyone!",
            "sender": "bob",
            "senderId": "bob_id",
            "timestamp": datetime.now() - timedelta(minutes=5),
            "isOwnMessage": False
        }
    ],
    "chat_2": [
        {
            "id": "msg_2_1",
            "text": "Anyone working on React projects?",
            "sender": "charlie",
            "senderId": "charlie_id",
            "timestamp": datetime.now() - timedelta(minutes=30),
            "isOwnMessage": False
        },
        {
            "id": "msg_2_2",
            "text": "I am! Building a chat app.",
            "sender": "dave",
            "senderId": "dave_id",
            "timestamp": datetime.now() - timedelta(minutes=25),
            "isOwnMessage": False
        }
    ],
    "chat_3": [
        {
            "id": "msg_3_1",
            "text": "Happy coding!",
            "sender": "eve",
            "senderId": "eve_id",
            "timestamp": datetime.now() - timedelta(hours=2),
            "isOwnMessage": False
        }
    ]
}