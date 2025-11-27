import type { MessageType } from './MessageType';

export interface BaseWebSocketMessage {
  type: string;
  timestamp: string;
}

export interface ConnectedMessage extends BaseWebSocketMessage {
  type: 'connected';
  userId: string;
  message: string;
}

export interface NewMessageNotification extends BaseWebSocketMessage {
  type: 'new_message';
  chatId: string;
  message: MessageType;
}

export interface ChatUpdateNotification extends BaseWebSocketMessage {
  type: 'chat_update';
  chatId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
}

export interface UserTypingNotification extends BaseWebSocketMessage {
  type: 'user_typing';
  chatId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ErrorMessage extends BaseWebSocketMessage {
  type: 'error';
  error: string;
  details?: string;
}

export interface SubscriptionConfirmed extends BaseWebSocketMessage {
  type: 'subscription_confirmed';
  action: 'subscribe' | 'unsubscribe';
  chatId: string;
  message: string;
}

export type WebSocketMessage =
  | ConnectedMessage
  | NewMessageNotification
  | ChatUpdateNotification
  | UserTypingNotification
  | ErrorMessage
  | SubscriptionConfirmed;
