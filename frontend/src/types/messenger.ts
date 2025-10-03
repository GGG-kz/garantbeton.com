export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  recipientId?: string // Для личных сообщений
  recipientName?: string
  recipientRole?: string
  chatId: string // ID чата (личного или группового)
  chatType: 'private' | 'group'
  content: string
  messageType: 'text' | 'image' | 'file' | 'deleted' | 'system' | 'deleted'
  timestamp: string
  isRead: boolean
  isEdited?: boolean
  editedAt?: string
  replyTo?: string // ID сообщения, на которое отвечают
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  name: string
  type: 'image' | 'document' | 'file'
  size: number
  url: string
}

export interface Chat {
  id: string
  name: string
  type: 'private' | 'group'
  participants: ChatParticipant[]
  lastMessage?: Message
  lastMessageAt?: string
  unreadCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatParticipant {
  id: string
  name: string
  role: string
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
}

export interface CreateMessageRequest {
  recipientId?: string
  chatId: string
  chatType: 'private' | 'group'
  content: string
  messageType: 'text' | 'image' | 'file' | 'deleted'
  replyTo?: string
}

export interface CreateChatRequest {
  name: string
  type: 'private' | 'group'
  participants: string[] // ID участников
}

// Типы для уведомлений
export interface Notification {
  id: string
  userId: string
  type: 'message' | 'mention' | 'request' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: any // Дополнительные данные
}

// Константы для UI
export const MESSAGE_TYPES = {
  text: 'Текст',
  image: 'Изображение',
  file: 'Файл',
  system: 'Системное'
} as const

export const CHAT_TYPES = {
  private: 'Личный чат',
  group: 'Групповой чат'
} as const

export const NOTIFICATION_TYPES = {
  message: 'Сообщение',
  mention: 'Упоминание',
  request: 'Заявка',
  system: 'Система'
} as const
