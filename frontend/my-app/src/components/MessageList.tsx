import { useEffect, useRef } from 'react';
import Message from './Message';
import type { MessageType } from '../types/MessageType';


interface MessageListProps {
  messages: MessageType[];
}

function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">No messages yet. Start the conversation!</div>
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            text={message.text}
            sender={message.senderId}
            timestamp={message.timestamp}
            isOwnMessage={message.isOwnMessage}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
