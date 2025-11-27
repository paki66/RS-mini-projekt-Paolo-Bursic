import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="message-input-field"
        disabled={disabled}
      />
      <button onClick={handleSend} className="send-button" disabled={disabled}>
        {disabled ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}

export default MessageInput;
