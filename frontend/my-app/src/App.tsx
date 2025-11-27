import { useState } from 'react';
import './App.css';
import ChatList from './components/ChatList';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import type { MessageType } from './types/MessageType';
import type { Chat } from './types/Chat';

function App() {
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Mock chat data
  const [chats] = useState<Chat[]>([
    {
      id: '1',
      name: 'General',
      lastMessage: 'Welcome to the general chat!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unreadCount: 2
    },
    {
      id: '2',
      name: 'Tech Talk',
      lastMessage: 'Anyone working on React projects?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 0
    },
    {
      id: '3',
      name: 'Random',
      lastMessage: 'Happy coding!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 5
    },
  ]);

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    // Clear messages when switching chats (in real app, would load chat-specific messages)
    setMessages([]);
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
  };

  const handleSendMessage = (text: string) => {
    const newMessage: MessageType = {
      id: Date.now().toString(),
      text,
      sender: username,
      timestamp: new Date(),
      isOwnMessage: true,
    };
    setMessages([...messages, newMessage]);
  };

  const getSelectedChatName = () => {
    const chat = chats.find(c => c.id === selectedChatId);
    return chat?.name || 'Chat';
  };

  if (!isUsernameSet) {
    return (
      <div className="username-container">
        <div className="username-card">
          <h1>Welcome to Chat</h1>
          <p>Enter your name to start chatting</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
            placeholder="Your name"
            className="username-input"
          />
          <button onClick={handleSetUsername} className="join-button">
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  // Show chat list if no chat is selected
  if (!selectedChatId) {
    return <ChatList chats={chats} onSelectChat={handleSelectChat} />;
  }

  // Show selected chat conversation
  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={handleBackToChats} className="back-button">
          ← Back
        </button>
        <h2>{getSelectedChatName()}</h2>
        <span className="username-display">Logged in as: {username}</span>
      </div>
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;
