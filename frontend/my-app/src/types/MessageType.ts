export interface MessageType {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  isOwnMessage: boolean;
}