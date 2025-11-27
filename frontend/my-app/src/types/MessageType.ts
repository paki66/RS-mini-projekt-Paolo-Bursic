export interface MessageType {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOwnMessage: boolean;
}