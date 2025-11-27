import { API_BASE_URL } from '../config/api';
import type { Chat } from '../types/Chat';
import type { MessageType } from '../types/MessageType';

// Response types
export interface LoginResponse {
  success: boolean;
  userId: string;
  username: string;
  message?: string;
}

export interface ChatsResponse {
  success: boolean;
  chats: Chat[];
}

export interface ChatDetailsResponse {
  success: boolean;
  chat: Chat;
  messages: MessageType[];
}

// Helper functions to convert API responses
function convertToChat(rawChat: any): Chat {
  return {
    id: rawChat.id,
    name: rawChat.name,
    lastMessage: rawChat.lastMessage,
    lastMessageTime: rawChat.lastMessageTime ? new Date(rawChat.lastMessageTime) : undefined,
    unreadCount: rawChat.unreadCount,
  };
}

function convertToMessage(rawMessage: any): MessageType {
  return {
    id: rawMessage.id,
    text: rawMessage.text,
    sender: rawMessage.sender,
    timestamp: new Date(rawMessage.timestamp),
    isOwnMessage: rawMessage.isOwnMessage,
  };
}

// API Service
class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Login - POST /login
  async login(username: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  // Get user's chats - GET /chats
  async getChats(userId: string): Promise<ChatsResponse> {
    const response: any = await this.request(`/chats?userId=${userId}`);

    return {
      success: response.success,
      chats: response.chats.map(convertToChat),
    };
  }

  // Get chat details and messages - GET /chats/:chatId
  async getChatDetails(chatId: string, userId?: string): Promise<ChatDetailsResponse> {
    const url = userId
      ? `/chats/${chatId}?userId=${userId}`
      : `/chats/${chatId}`;
    const response: any = await this.request(url);

    return {
      success: response.success,
      chat: convertToChat(response.chat),
      messages: response.messages.map(convertToMessage),
    };
  }

  // Send message - POST /chats/:chatId/messages
  async sendMessage(
    chatId: string,
    message: string,
    senderId: string
  ): Promise<{ success: boolean; message: MessageType }> {
    const response: any = await this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        text: message,
        senderId,
      }),
    });

    return {
      success: response.success,
      message: convertToMessage(response.message),
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
