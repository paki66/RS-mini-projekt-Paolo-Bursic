interface MessageProps {
    text: string,
    sender: string,
    timestamp: Date,
    isOwnMessage: boolean
}

function Message({text, sender, timestamp, isOwnMessage}: MessageProps) {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            <div className="message-header">
                <span className="message-sender">{sender}</span>
                <span className="message-time">{formatTime(timestamp)}</span>
            </div>
            <div className="message-text">{text}</div>
        </div>
    );
}

export default Message;
