import React, { useState } from 'react'
import ResponsiveLayout from '../components/ResponsiveLayout'
import MobileMessengerLayout from '../components/messenger/MobileMessengerLayout'
import ChatList from '../components/messenger/ChatList'
import MessageList from '../components/messenger/MessageList'
import { Chat, Message } from '../types/messenger'
import { useAuthStore } from '../stores/authStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMobile } from '../hooks/useMobile'
import { MessageCircle } from 'lucide-react'

const mockChats: Chat[] = [
  {
    id: 'chat-1',
    name: 'Петя',
    type: 'private',
    participants: [
      { id: 'user-1', name: 'Петя', role: 'manager' },
      { id: 'user-2', name: 'Вы', role: 'developer' }
    ],
    lastMessage: {
      id: 'msg-1',
      senderId: 'user-1',
      senderName: 'Петя',
      senderRole: 'manager',
      chatId: 'chat-1',
      chatType: 'private',
      content: 'Привет! Как дела с проектом?',
      messageType: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 минут назад
      isRead: false
    },
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unreadCount: 2,
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 день назад
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'chat-2',
    name: 'Команда разработки',
    type: 'group',
    participants: [
      { id: 'user-1', name: 'Петя', role: 'manager' },
      { id: 'user-2', name: 'Вы', role: 'developer' },
      { id: 'user-3', name: 'Анна', role: 'developer' },
      { id: 'user-4', name: 'Михаил', role: 'designer' }
    ],
    lastMessage: {
      id: 'msg-2',
      senderId: 'user-3',
      senderName: 'Анна',
      senderRole: 'developer',
      chatId: 'chat-2',
      chatType: 'group',
      content: 'Готово! Все тесты прошли успешно 🎉',
      messageType: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 часа назад
      isRead: true
    },
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unreadCount: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 неделя назад
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'chat-3',
    name: 'Мария',
    type: 'private',
    participants: [
      { id: 'user-5', name: 'Мария', role: 'accountant' },
      { id: 'user-2', name: 'Вы', role: 'developer' }
    ],
    lastMessage: {
      id: 'msg-3',
      senderId: 'user-5',
      senderName: 'Мария',
      senderRole: 'accountant',
      chatId: 'chat-3',
      chatType: 'private',
      content: 'Документы готовы, можете забрать',
      messageType: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 день назад
      isRead: true
    },
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 дня назад
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
]

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'user-1',
    senderName: 'Петя',
    senderRole: 'manager',
    chatId: 'chat-1',
    chatType: 'private',
    content: 'Привет! Как дела с проектом?',
    messageType: 'text',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false
  },
  {
    id: 'msg-2',
    senderId: 'user-2',
    senderName: 'Вы',
    senderRole: 'developer',
    chatId: 'chat-1',
    chatType: 'private',
    content: 'Все отлично! Функции мессенджера работают',
    messageType: 'text',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: true
  },
  {
    id: 'msg-3',
    senderId: 'user-1',
    senderName: 'Петя',
    senderRole: 'manager',
    chatId: 'chat-1',
    chatType: 'private',
    content: 'Отлично! Покажи мне как это работает 😊',
    messageType: 'text',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    isRead: false
  },
  {
    id: 'msg-4',
    senderId: 'user-3',
    senderName: 'Анна',
    senderRole: 'developer',
    chatId: 'chat-2',
    chatType: 'group',
    content: 'Готово! Все тесты прошли успешно 🎉',
    messageType: 'text',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: true
  },
  {
    id: 'msg-5',
    senderId: 'user-4',
    senderName: 'Михаил',
    senderRole: 'designer',
    chatId: 'chat-2',
    chatType: 'group',
    content: 'Супер! Дизайн тоже готов 👍',
    messageType: 'text',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    isRead: true
  },
  {
    id: 'msg-6',
    senderId: 'user-5',
    senderName: 'Мария',
    senderRole: 'accountant',
    chatId: 'chat-3',
    chatType: 'private',
    content: 'Документы готовы, можете забрать',
    messageType: 'text',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true
  }
]

export default function MessengerPage() {
  const { user } = useAuthStore()
  const { isNative } = useMobile()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [chats, setChats] = useLocalStorage<Chat[]>('chats', mockChats)
  const [messages, setMessages] = useLocalStorage<Message[]>('messages', mockMessages)

  const selectedChatId = selectedChat?.id


  // Отладочная информация
  console.log('MessengerPage Debug:', {
    user: user?.id,
    chatsCount: chats.length,
    messagesCount: messages.length,
    chats: chats.map(c => ({ id: c.id, name: c.name, type: c.type }))
  })

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)

    // Отмечаем сообщения как прочитанные
    if (chat.unreadCount > 0) {
      setMessages(prev =>
        prev.map(msg =>
          msg.chatId === chat.id && !msg.isRead
            ? { ...msg, isRead: true }
            : msg
        )
      )

      // Обновляем счетчик непрочитанных в чате
      setChats(prev =>
        prev.map(c =>
          c.id === chat.id
            ? { ...c, unreadCount: 0 }
            : c
        )
      )
    }
  }

  const handleSendMessage = (content: string, replyTo?: string) => {
    if (!user || !selectedChat) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.fullName || user.login,
      senderRole: user.role,
      chatId: selectedChat.id,
      chatType: selectedChat.type,
      recipientId: selectedChat.type === 'private'
        ? selectedChat.participants.find(p => p.id !== user.id)?.id
        : undefined,
      recipientName: selectedChat.type === 'private'
        ? selectedChat.participants.find(p => p.id !== user.id)?.name
        : undefined,
      recipientRole: selectedChat.type === 'private'
        ? selectedChat.participants.find(p => p.id !== user.id)?.role
        : undefined,
      content,
      messageType: 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
      replyTo
    }

    // Добавляем сообщение в конец списка (хронологический порядок)
    setMessages(prev => [...prev, newMessage])

    // Обновляем последнее сообщение в чате
    setChats(prev =>
      prev.map(chat =>
        chat.id === selectedChat.id
          ? {
            ...chat,
            lastMessage: newMessage,
            lastMessageAt: newMessage.timestamp,
            unreadCount: selectedChat.type === 'group' ? chat.unreadCount + 1 : chat.unreadCount
          }
          : chat
      )
    )
  }

  if (!user) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-mono-900 mb-2">
              Доступ запрещен
            </h3>
            <p className="text-mono-600">Необходимо войти в систему</p>
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

  // Мобильная версия мессенджера
  if (isNative || window.innerWidth < 768) {
    return (
      <MobileMessengerLayout
        chats={chats}
        messages={messages}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        onSendMessage={handleSendMessage}
        currentUserId={user.id}
        onUpdateMessages={setMessages}
        onUpdateChat={setSelectedChat}
      />
    )
  }

  // Десктопная версия
  return (
    <ResponsiveLayout>
      <div className="card overflow-hidden h-[600px] md:h-[700px] flex">
        {/* Mobile: Show either chat list or messages */}
        <div className="md:hidden w-full">
          {!selectedChat ? (
            <ChatList
              chats={chats}
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChatId}
              currentUserId={user.id}
            />
          ) : (
            <MessageList
              chat={selectedChat}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBackToChats={() => setSelectedChat(null)}
              onUpdateMessages={setMessages}
              onUpdateChat={setSelectedChat}
            />
          )}
        </div>

        {/* Desktop: Show both side by side */}
        <div className="hidden md:flex w-full">
          <ChatList
            chats={chats}
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChatId}
            currentUserId={user.id}
          />
          <MessageList
            chat={selectedChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            onUpdateMessages={setMessages}
            onUpdateChat={setSelectedChat}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-interactive animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-mono-700 text-sm uppercase tracking-wide">Всего чатов</h4>
              <p className="text-3xl font-bold text-black mt-2">
                {chats.length}
              </p>
            </div>
            <div className="p-4 bg-black rounded-lg group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card-interactive animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-mono-700 text-sm uppercase tracking-wide">Активные чаты</h4>
              <p className="text-3xl font-bold text-black mt-2">
                {chats.filter(chat => chat.isActive).length}
              </p>
            </div>
            <div className="p-4 bg-mono-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card-interactive animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-mono-700 text-sm uppercase tracking-wide">Непрочитанные</h4>
              <p className="text-3xl font-bold text-black mt-2">
                {chats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
              </p>
            </div>
            <div className="p-4 bg-mono-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>


      {/* Info */}
      <div className="mt-8 card-primary animate-fade-in">
        <div className="flex items-start space-x-4 mb-6">
          <div className="p-3 bg-black rounded-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-black mb-2">О мессенджере</h4>
            <p className="text-mono-600 leading-relaxed">
              Внутренняя система общения для координации работы между сотрудниками.
              Поддерживает личные и групповые чаты с минималистичным интерфейсом.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h5 className="font-semibold text-black flex items-center">
              <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
              Функции
            </h5>
            <div className="space-y-2">
              {[
                'Отправка сообщений',
                'Ответы на сообщения',
                'Групповые чаты',
                'Уведомления в реальном времени'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-mono-600">
                  <div className="w-1.5 h-1.5 bg-mono-800 rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-black flex items-center">
              <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
              Доступ
            </h5>
            <p className="text-sm text-mono-600 leading-relaxed">
              Все сотрудники могут использовать мессенджер для общения и координации работы.
              Система поддерживает ролевую модель доступа.
            </p>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
