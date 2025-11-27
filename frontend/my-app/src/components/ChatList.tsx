import type { Chat } from '../types/Chat';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
}

function ChatList({ chats, onSelectChat }: ChatListProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>Chats</h2>
      </div>
      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="empty-state">No chats available</div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="chat-avatar">
                {chat.name.charAt(0).toUpperCase()}
              </div>
              <div className="chat-info">
                <div className="chat-name-row">
                  <span className="chat-name">{chat.name}</span>
                  {chat.lastMessageTime && (
                    <span className="chat-time">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  )}
                </div>
                {chat.lastMessage && (
                  <div className="chat-last-message-row">
                    <span className="chat-last-message">{chat.lastMessage}</span>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <span className="unread-badge">{chat.unreadCount}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;
