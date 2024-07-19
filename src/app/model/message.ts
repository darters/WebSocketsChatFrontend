

export interface Message {
  id?: string
  content: string
  chatId?: string
  messageStatus: MessageStatus
  recipientId: string
  recipientName: string
  senderId: number
  senderName: string
  timestamp: Date
}

export enum MessageStatus {
  DELIVERED = 'DELIVERED',
  RECEIVED = 'RECEIVED'
}

