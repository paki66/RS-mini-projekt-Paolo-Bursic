import { useState, useEffect } from 'react';
import './App.css';
import ChatList from './components/ChatList';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import type { MessageType } from './types/MessageType';
import type { Chat } from './types/Chat';
import { apiService } from './services/api';
import { websocketService } from './services/websocket';

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
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Handle login
  const handleSetUsername = async () => {
    if (!username.trim()) return;

    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await apiService.login(username.trim());

      if (response.success) {
        setUserId(response.userId);
        websocketService.connect(response.userId);
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
      const response = await apiService.getChatDetails(chatId, userId || undefined);

      if (response.success) {
        setMessages(response.messages);
        websocketService.subscribeToChat(chatId);
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
    if (selectedChatId) {
      websocketService.unsubscribeFromChat(selectedChatId);
    }
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
        const messageWithCorrectOwnership: MessageType = {
          ...response.message,
          isOwnMessage: true,
        };
        setMessages([...messages, messageWithCorrectOwnership]);
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

  useEffect(() => {
    const unsubscribeMessage = websocketService.onMessage((data) => {
      if (data.chatId === selectedChatId) {
        const newMessage: MessageType = {
          ...data.message,
          timestamp: new Date(data.message.timestamp),
          isOwnMessage: data.message.senderId === userId,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    const unsubscribeChatUpdate = websocketService.onChatUpdate((data) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === data.chatId
            ? {
                ...chat,
                lastMessage: data.lastMessage,
                lastMessageTime: new Date(data.lastMessageTime),
                unreadCount: data.unreadCount ?? chat.unreadCount,
              }
            : chat
        )
      );
    });

    const unsubscribeError = websocketService.onError((error, details) => {
      console.error('WebSocket error:', error, details);
      setError(`Connection error: ${error}`);
    });

    const unsubscribeConnect = websocketService.onConnect(() => {
      setWsConnected(true);
      console.log('WebSocket connected');
    });

    const unsubscribeDisconnect = websocketService.onDisconnect(() => {
      setWsConnected(false);
      console.log('WebSocket disconnected');
    });

    const unsubscribeTyping = websocketService.onTyping((data) => {
      if (data.chatId === selectedChatId && data.userId !== userId) {
        if (data.isTyping) {
          setTypingUsers((prev) => new Set(prev).add(data.username));
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.username);
              return newSet;
            });
          }, 3000);
        } else {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.username);
            return newSet;
          });
        }
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeChatUpdate();
      unsubscribeError();
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeTyping();
    };
  }, [selectedChatId, userId]);

  useEffect(() => {
    return () => {
      websocketService.disconnect();
    };
  }, []);

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
        <h2>
          {getSelectedChatName()}
          <span className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
            {wsConnected ? '●' : '○'}
          </span>
        </h2>
        <span className="username-display">Logged in as: {username}</span>
      </div>
      {typingUsers.size > 0 && (
        <div className="typing-indicator">
          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}
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
            onTyping={(isTyping) => {
              if (selectedChatId) {
                websocketService.sendTypingIndicator(selectedChatId, isTyping);
              }
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
