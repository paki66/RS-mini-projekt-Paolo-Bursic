import { useState } from 'react';
import './App.css';
import ChatList from './components/ChatList';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import type { MessageType } from './types/MessageType';
import type { Chat } from './types/Chat';
import { apiService } from './services/api';

function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Loading and error states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle login
  const handleSetUsername = async () => {
    if (!username.trim()) return;

    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await apiService.login(username.trim());

      if (response.success) {
        setUserId(response.userId);
        // After successful login, fetch user's chats
        await fetchChats(response.userId);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Fetch user's chats
  const fetchChats = async (userIdToFetch: string) => {
    setIsLoadingChats(true);
    setError(null);

    try {
      const response = await apiService.getChats(userIdToFetch);

      if (response.success) {
        setChats(response.chats);
      } else {
        setError('Failed to load chats');
      }
    } catch (err) {
      setError('Failed to load chats. Please try again.');
      console.error('Fetch chats error:', err);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Handle chat selection
  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    setIsLoadingMessages(true);
    setError(null);

    try {
      const response = await apiService.getChatDetails(chatId);

      if (response.success) {
        setMessages(response.messages);
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      console.error('Fetch messages error:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Handle back to chats
  const handleBackToChats = () => {
    setSelectedChatId(null);
    setMessages([]);
  };

  // Handle send message
  const handleSendMessage = async (text: string) => {
    if (!userId || !selectedChatId) return;

    setIsSendingMessage(true);
    setError(null);

    try {
      const response = await apiService.sendMessage(
        selectedChatId,
        text,
        userId
      );

      if (response.success) {
        // Add the new message to the list
        setMessages([...messages, response.message]);
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Get selected chat name
  const getSelectedChatName = () => {
    const chat = chats.find(c => c.id === selectedChatId);
    return chat?.name || 'Chat';
  };

  // Login screen
  if (!userId) {
    return (
      <div className="username-container">
        <div className="username-card">
          <h1>Welcome to Chat</h1>
          <p>Enter your name to start chatting</p>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoggingIn && handleSetUsername()}
            placeholder="Your name"
            className="username-input"
            disabled={isLoggingIn}
          />
          <button
            onClick={handleSetUsername}
            className="join-button"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Join Chat'}
          </button>
        </div>
      </div>
    );
  }

  // Chat list screen
  if (!selectedChatId) {
    return (
      <div className="chat-list-wrapper">
        {error && <div className="error-banner">{error}</div>}
        {isLoadingChats ? (
          <div className="loading-container">
            <div className="loading-spinner">Loading chats...</div>
          </div>
        ) : (
          <ChatList chats={chats} onSelectChat={handleSelectChat} />
        )}
      </div>
    );
  }

  // Chat conversation screen
  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={handleBackToChats} className="back-button">
          ← Back
        </button>
        <h2>{getSelectedChatName()}</h2>
        <span className="username-display">Logged in as: {username}</span>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {isLoadingMessages ? (
        <div className="loading-container">
          <div className="loading-spinner">Loading messages...</div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} />
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isSendingMessage}
          />
        </>
      )}
    </div>
  );
}

export default App;
