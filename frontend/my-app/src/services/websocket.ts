import type {
  WebSocketMessage,
  NewMessageNotification,
  ChatUpdateNotification,
  UserTypingNotification,
} from '../types/WebSocketMessage';

export type MessageHandler = (data: NewMessageNotification) => void;
export type ChatUpdateHandler = (data: ChatUpdateNotification) => void;
export type TypingHandler = (data: UserTypingNotification) => void;
export type ErrorHandler = (error: string, details?: string) => void;
export type ConnectionHandler = () => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private isManuallyDisconnected = false;

  private messageHandlers: Set<MessageHandler> = new Set();
  private chatUpdateHandlers: Set<ChatUpdateHandler> = new Set();
  private typingHandlers: Set<TypingHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectHandlers: Set<ConnectionHandler> = new Set();
  private disconnectHandlers: Set<ConnectionHandler> = new Set();

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.userId = userId;
    this.isManuallyDisconnected = false;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    const url = `${wsUrl}/ws?userId=${userId}`;

    console.log('Connecting to WebSocket:', url);

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.connectHandlers.forEach(handler => handler());
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.disconnectHandlers.forEach(handler => handler());

      if (!this.isManuallyDisconnected) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.errorHandlers.forEach(handler =>
        handler('WebSocket connection error', 'Failed to connect to server')
      );
    };
  }

  private handleMessage(data: WebSocketMessage) {
    console.log('WebSocket message received:', data);

    switch (data.type) {
      case 'connected':
        console.log('Connection acknowledged:', data.message);
        break;

      case 'new_message':
        this.messageHandlers.forEach(handler => handler(data));
        break;

      case 'chat_update':
        this.chatUpdateHandlers.forEach(handler => handler(data));
        break;

      case 'user_typing':
        this.typingHandlers.forEach(handler => handler(data));
        break;

      case 'error':
        console.error('Server error:', data.error, data.details);
        this.errorHandlers.forEach(handler => handler(data.error, data.details));
        break;

      case 'subscription_confirmed':
        console.log('Subscription confirmed:', data.message);
        break;

      default:
        console.warn('Unknown message type:', data);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.errorHandlers.forEach(handler =>
        handler('Connection lost', 'Unable to reconnect to server')
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = window.setTimeout(() => {
      if (this.userId && !this.isManuallyDisconnected) {
        this.connect(this.userId);
      }
    }, delay);
  }

  subscribeToChat(chatId: string) {
    this.send({ action: 'subscribe', chatId });
  }

  unsubscribeFromChat(chatId: string) {
    this.send({ action: 'unsubscribe', chatId });
  }

  sendTypingIndicator(chatId: string, isTyping: boolean) {
    this.send({ type: 'typing', chatId, isTyping });
  }

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected, cannot send:', data);
    }
  }

  disconnect() {
    this.isManuallyDisconnected = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.userId = null;
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onChatUpdate(handler: ChatUpdateHandler) {
    this.chatUpdateHandlers.add(handler);
    return () => this.chatUpdateHandlers.delete(handler);
  }

  onTyping(handler: TypingHandler) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  onConnect(handler: ConnectionHandler) {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler) {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
