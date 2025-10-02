import { useState, useEffect, useRef } from 'react'
import { Message, Chat } from '../../types/messenger'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useAuthStore } from '../../stores/authStore'
import { Send, Paperclip, MoreVertical, Reply, Edit, Trash2, MessageCircle, Users } from 'lucide-react'

interface MessageListProps {
  chat: Chat | null
  messages: Message[]
  onSendMessage: (content: string, replyTo?: string) => void
  onBackToChats?: () => void
}


export default function MessageList({ chat, messages, onSendMessage, onBackToChats }: MessageListProps) {
  const { user } = useAuthStore()
  const [newMessage, setNewMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Фильтруем сообщения для текущего чата и сортируем по времени (старые сверху)
  const chatMessages = chat ? messages
    .filter(msg => msg.chatId === chat.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : []

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !chat || !user) return

    onSendMessage(newMessage.trim(), replyingTo?.id)
    setNewMessage('')
    setReplyingTo(null)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  const shouldShowDate = (message: Message, prevMessage: Message | undefined) => {
    if (!prevMessage) return true
    
    const messageDate = new Date(message.timestamp)
    const prevDate = new Date(prevMessage.timestamp)
    
    return messageDate.toDateString() !== prevDate.toDateString()
  }

  const shouldShowAvatar = (message: Message, prevMessage: Message | undefined) => {
    if (!prevMessage) return true
    if (message.senderId !== prevMessage.senderId) return true
    
    const messageTime = new Date(message.timestamp)
    const prevTime = new Date(prevMessage.timestamp)
    const diffInMinutes = (messageTime.getTime() - prevTime.getTime()) / (1000 * 60)
    
    return diffInMinutes > 5 // Показываем аватар если прошло больше 5 минут
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'director': return 'text-black bg-mono-100'
      case 'manager': return 'text-mono-800 bg-mono-100'
      case 'supply': return 'text-mono-700 bg-mono-100'
      case 'driver': return 'text-mono-600 bg-mono-100'
      case 'dispatcher': return 'text-black bg-mono-100'
      case 'accountant': return 'text-mono-900 bg-mono-100'
      default: return 'text-mono-600 bg-mono-100'
    }
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-mono-50">
        <div className="text-center p-6">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-mono-300" />
          <h3 className="text-lg font-medium text-mono-900 mb-2">
            Выберите чат
          </h3>
          <p className="text-mono-500">
            Выберите чат из списка слева, чтобы начать общение
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-6 border-b border-mono-200 bg-mono-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile back button */}
            {onBackToChats && (
              <button
                onClick={onBackToChats}
                className="md:hidden p-2.5 text-mono-500 hover:text-mono-700 hover:bg-mono-100 rounded-xl mobile-touch-target transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center">
              {chat.type === 'group' ? (
                <Users className="h-6 w-6 text-white" />
              ) : (
                <MessageCircle className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">
                {chat.name}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-mono-800 rounded-full animate-pulse"></div>
                <p className="text-sm text-mono-600 font-medium">
                  {chat.participants.length} участников
                </p>
              </div>
            </div>
          </div>
          <button className="p-2.5 text-mono-500 hover:text-mono-700 hover:bg-mono-100 rounded-xl mobile-touch-target transition-all duration-200 hover:scale-105 active:scale-95">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center text-mono-500 mt-16 p-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-mono-100 rounded-3xl flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-mono-400" />
            </div>
            <p className="font-semibold text-mono-700 text-lg">Нет сообщений</p>
            <p className="text-sm mt-2 text-mono-500">Начните общение, отправив первое сообщение</p>
          </div>
        ) : (
          chatMessages.map((message, index) => {
            const prevMessage = chatMessages[index - 1]
            const isOwnMessage = message.senderId === user?.id
            const showDate = shouldShowDate(message, prevMessage)
            const showAvatar = shouldShowAvatar(message, prevMessage)

            return (
              <div key={message.id}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex justify-center my-6">
                    <span className="px-4 py-2 text-xs font-semibold text-mono-600 bg-mono-100 rounded-full shadow-soft">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}

                {/* Message */}
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${!showAvatar ? 'mt-2' : 'mt-4'} animate-slide-up`}>
                  <div className={`flex max-w-xs md:max-w-sm lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3`}>
                    {/* Avatar */}
                    {showAvatar && !isOwnMessage && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-mono-200 to-mono-300 flex items-center justify-center shadow-soft">
                          <span className="text-xs font-bold text-mono-700">
                            {message.senderName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message content */}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {/* Sender name */}
                      {showAvatar && !isOwnMessage && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-semibold text-mono-900">
                            {message.senderName}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(message.senderRole)}`}>
                            {message.senderRole}
                          </span>
                        </div>
                      )}

                      {/* Reply indicator */}
                      {message.replyTo && (
                        <div className="mb-2 p-3 bg-mono-50 border-l-4 border-mono-400 rounded-lg text-xs text-mono-600 shadow-soft">
                          <div className="font-medium text-mono-700">Ответ на сообщение</div>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                          isOwnMessage
                            ? 'bg-black text-white'
                            : 'bg-white border-2 border-mono-200 text-black hover:border-mono-300'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs text-mono-500 mt-1 px-2 font-medium">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-6 py-4 bg-mono-100 border-t border-mono-200 animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black">
                Ответ на сообщение от {replyingTo.senderName}
              </p>
              <p className="text-xs text-mono-700 truncate mt-1">
                {replyingTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-mono-600 hover:text-black p-2 mobile-touch-target rounded-lg hover:bg-mono-200 transition-all duration-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-6 border-t border-mono-200 bg-mono-50">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <button
            type="button"
            className="btn-ghost p-3 rounded-xl mobile-touch-target"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Напишите сообщение..."
              className="input-field rounded-2xl text-base resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary p-3 rounded-2xl mobile-touch-target"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
