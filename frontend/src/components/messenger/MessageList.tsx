import { useState, useEffect, useRef } from 'react'
import { Message, Chat } from '../../types/messenger'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useAuthStore } from '../../stores/authStore'
import { Send, Paperclip, MoreVertical, Reply, Edit, Trash2, MessageCircle, Users, Link, Copy, X } from 'lucide-react'

interface MessageListProps {
  chat: Chat | null
  messages: Message[]
  onSendMessage: (content: string, replyTo?: string) => void
  onBackToChats?: () => void
  isMobile?: boolean
  onUpdateMessages?: (messages: Message[]) => void
  onUpdateChat?: (chat: Chat) => void
}


export default function MessageList({ chat, messages, onSendMessage, onBackToChats, isMobile = false, onUpdateMessages, onUpdateChat }: MessageListProps) {
  const { user } = useAuthStore()
  const [newMessage, setNewMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showMessageMenu, setShowMessageMenu] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [editText, setEditText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Фильтруем сообщения для текущего чата и сортируем по времени (старые сверху)
  const chatMessages = chat ? messages
    .filter(msg => msg.chatId === chat.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : []

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  // Обработка якорных ссылок на сообщения
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#message-')) {
        const messageId = hash.replace('#message-', '')
        const messageElement = document.getElementById(`message-${messageId}`)
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Подсветка сообщения
          messageElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
          setTimeout(() => {
            messageElement.style.backgroundColor = ''
          }, 3000)
        }
      }
    }

    // Проверяем хеш при загрузке
    handleHashChange()

    // Слушаем изменения хеша
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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

  // Симуляция печати при вводе
  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 2000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [newMessage])

  // Функция для копирования ссылки на сообщение
  const copyMessageLink = (messageId: string) => {
    const messageLink = `${window.location.origin}${window.location.pathname}#message-${messageId}`
    navigator.clipboard.writeText(messageLink).then(() => {
      // Можно добавить уведомление об успешном копировании
      console.log('Ссылка на сообщение скопирована:', messageLink)
    }).catch(err => {
      console.error('Ошибка при копировании ссылки:', err)
    })
  }

  // Функции удаления сообщений
  const deleteMessageForAll = (messageId: string) => {
    if (!onUpdateMessages) return
    
    // Удаляем сообщение из локального состояния
    const updatedMessages = messages.filter(msg => msg.id !== messageId)
    onUpdateMessages(updatedMessages)
    
    // Обновляем lastMessage в чате, если это было последнее сообщение
    if (chat && chat.lastMessage?.id === messageId && onUpdateChat) {
      const remainingMessages = updatedMessages.filter(msg => msg.chatId === chat.id)
      const newLastMessage = remainingMessages[remainingMessages.length - 1] || null
      
      onUpdateChat({
        ...chat,
        lastMessage: newLastMessage,
        lastMessageAt: newLastMessage?.timestamp || chat.createdAt
      })
    }
    
    console.log('Сообщение удалено для всех:', messageId)
    setShowMessageMenu(false)
    setSelectedMessage(null)
  }

  const deleteMessageForMe = (messageId: string) => {
    if (!onUpdateMessages) return
    
    // Помечаем сообщение как удаленное для текущего пользователя
    const updatedMessages = messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: 'Сообщение удалено', messageType: 'deleted' as const }
        : msg
    )
    onUpdateMessages(updatedMessages)
    
    console.log('Сообщение удалено для меня:', messageId)
    setShowMessageMenu(false)
    setSelectedMessage(null)
  }

  const handleMessageClick = (message: Message) => {
    if (message.senderId === user?.id && message.messageType !== 'deleted') {
      setSelectedMessage(message)
      setShowMessageMenu(true)
    }
  }

  // Функции редактирования сообщений
  const startEditing = (message: Message) => {
    setEditingMessage(message)
    setEditText(message.content)
    setShowMessageMenu(false)
  }

  const saveEdit = () => {
    if (editingMessage && editText.trim()) {
      // Здесь должна быть логика сохранения изменений
      console.log('Редактировать сообщение:', editingMessage.id, editText)
      setEditingMessage(null)
      setEditText('')
    }
  }

  const cancelEdit = () => {
    setEditingMessage(null)
    setEditText('')
  }

  // Функции ответов на сообщения
  const replyToMessage = (message: Message) => {
    setReplyingTo(message)
    setShowMessageMenu(false)
  }

  // Функция поиска сообщений
  const filteredMessages = searchQuery 
    ? chatMessages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chatMessages

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMessageMenu && !(event.target as Element).closest('.message-menu')) {
        setShowMessageMenu(false)
        setSelectedMessage(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMessageMenu])

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
    <div className={`flex-1 flex flex-col ${isMobile ? 'bg-mono-50' : 'bg-white'} ${isMobile ? 'h-screen' : ''}`}>
      {/* Chat Header - скрыт на мобильной версии, так как есть в MobileMessengerLayout */}
      {!isMobile && (
        <div className="p-6 border-b border-mono-200 bg-mono-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back button for desktop */}
            {onBackToChats && (
              <button
                onClick={onBackToChats}
                className="p-2.5 text-mono-500 hover:text-mono-700 hover:bg-mono-100 rounded-xl mobile-touch-target transition-all duration-200 hover:scale-105 active:scale-95"
                title="Назад к списку чатов"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Search messages */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Поиск сообщений..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 text-sm border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
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
      )}

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isMobile ? 'pb-24' : ''}`}>
        {filteredMessages.length === 0 ? (
          <div className="text-center text-mono-500 mt-16 p-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-mono-100 rounded-3xl flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-mono-400" />
            </div>
            <p className="font-semibold text-mono-700 text-lg">Нет сообщений</p>
            <p className="text-sm mt-2 text-mono-500">Начните общение, отправив первое сообщение</p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const prevMessage = filteredMessages[index - 1]
            const isOwnMessage = message.senderId === user?.id
            const showDate = shouldShowDate(message, prevMessage)
            const showAvatar = shouldShowAvatar(message, prevMessage)

            return (
              <div key={message.id} id={`message-${message.id}`}>
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
                  <div className={`flex ${isMobile ? 'max-w-[85%]' : 'max-w-xs md:max-w-sm lg:max-w-md'} ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                    {/* Avatar */}
                    {showAvatar && !isOwnMessage && (
                      <div className="flex-shrink-0">
                        <div className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} rounded-full ${isMobile ? 'bg-mono-600' : 'bg-gradient-to-br from-mono-200 to-mono-300'} flex items-center justify-center ${isMobile ? '' : 'shadow-soft'}`}>
                          <span className={`text-xs font-bold ${isMobile ? 'text-white' : 'text-mono-700'}`}>
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
                        className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} ${isMobile ? 'rounded-2xl' : 'rounded-lg'} transition-all duration-300 ${
                          isOwnMessage
                            ? isMobile 
                              ? 'bg-green-500 text-white' 
                              : 'bg-green-500 text-white'
                            : isMobile
                              ? 'bg-white text-black shadow-sm'
                              : 'bg-white border-2 border-mono-200 text-black hover:border-mono-300'
                        } ${isOwnMessage ? 'cursor-pointer hover:opacity-90' : ''}`}
                        onClick={() => handleMessageClick(message)}
                      >
                        {editingMessage?.id === message.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-2 py-1 text-sm bg-white bg-opacity-20 rounded border-none outline-none"
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={saveEdit}
                                className="px-3 py-1 bg-white bg-opacity-20 text-xs rounded hover:bg-opacity-30"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-white bg-opacity-20 text-xs rounded hover:bg-opacity-30"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className={`${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed ${
                            message.messageType === 'deleted' ? 'italic text-mono-500' : ''
                          }`}>
                            {message.messageType === 'deleted' ? 'Сообщение удалено' : message.content}
                          </p>
                        )}
                        
                        {/* Message ID and copy link button */}
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-xs opacity-50">
                            ID: {message.id}
                          </div>
                          <button
                            onClick={() => copyMessageLink(message.id)}
                            className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                            title="Скопировать ссылку на сообщение"
                          >
                            <Link className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Timestamp and read status */}
                      <div className={`flex items-center ${isOwnMessage ? 'justify-end' : 'justify-start'} mt-1 px-2 space-x-1`}>
                        <span className="text-xs text-mono-500 font-medium">
                          {formatTime(message.timestamp)}
                        </span>
                        {isOwnMessage && (
                          <div className="flex items-center space-x-1">
                            {/* Single checkmark - sent */}
                            <div className={`w-3 h-3 ${message.isRead ? 'text-blue-500' : 'text-white'}`}>
                              <svg viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                              </svg>
                            </div>
                            {/* Double checkmark - read */}
                            {message.isRead && (
                              <div className="w-3 h-3 text-blue-500">
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-slide-up">
            <div className="flex max-w-xs md:max-w-sm lg:max-w-md flex-row items-end space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-mono-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-mono-700">?</span>
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-mono-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-mono-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-mono-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Message input - fixed at bottom */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-t border-mono-200 ${isMobile ? 'bg-white' : 'bg-mono-50'} ${isMobile ? 'fixed bottom-0 left-0 right-0 z-10' : ''}`}>
        <form onSubmit={handleSendMessage} className={`flex items-end ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
          <button
            type="button"
            className={`btn-ghost ${isMobile ? 'p-2' : 'p-3'} ${isMobile ? 'rounded-full' : 'rounded-xl'} mobile-touch-target`}
          >
            <Paperclip className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`btn-ghost ${isMobile ? 'p-2' : 'p-3'} ${isMobile ? 'rounded-full' : 'rounded-xl'} mobile-touch-target`}
          >
            <span className="text-lg">😀</span>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Напишите сообщение..."
              className={`input-field ${isMobile ? 'rounded-full' : 'rounded-2xl'} text-base resize-none ${isMobile ? 'px-4 py-3' : ''}`}
            />
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-mono-200 rounded-lg shadow-lg p-4 max-w-xs">
                <div className="grid grid-cols-8 gap-1">
                  {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '😢', '😡', '🤗', '😴', '😎', '🤯', '🔥', '💯'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage(prev => prev + emoji)
                        setShowEmojiPicker(false)
                      }}
                      className="p-2 hover:bg-mono-100 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`btn-primary ${isMobile ? 'p-2' : 'p-3'} ${isMobile ? 'rounded-full' : 'rounded-2xl'} mobile-touch-target`}
          >
            <Send className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        </form>
      </div>

      {/* Message Delete Menu */}
      {showMessageMenu && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="message-menu bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Удалить сообщение</h3>
              <button
                onClick={() => setShowMessageMenu(false)}
                className="p-2 hover:bg-mono-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-mono-600 mb-6">
              Выберите, как удалить сообщение:
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => startEditing(selectedMessage)}
                className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center space-x-3"
              >
                <Edit className="h-5 w-5" />
                <div>
                  <div className="font-medium">Редактировать</div>
                  <div className="text-sm opacity-75">Изменить текст сообщения</div>
                </div>
              </button>

              <button
                onClick={() => replyToMessage(selectedMessage)}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors flex items-center space-x-3"
              >
                <Reply className="h-5 w-5" />
                <div>
                  <div className="font-medium">Ответить</div>
                  <div className="text-sm opacity-75">Ответить на это сообщение</div>
                </div>
              </button>
              
              <button
                onClick={() => deleteMessageForAll(selectedMessage.id)}
                className="w-full p-3 text-left bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors flex items-center space-x-3"
              >
                <Trash2 className="h-5 w-5" />
                <div>
                  <div className="font-medium">Удалить у всех</div>
                  <div className="text-sm opacity-75">Сообщение будет удалено для всех участников</div>
                </div>
              </button>
              
              <button
                onClick={() => deleteMessageForMe(selectedMessage.id)}
                className="w-full p-3 text-left bg-mono-50 hover:bg-mono-100 text-mono-700 rounded-lg transition-colors flex items-center space-x-3"
              >
                <X className="h-5 w-5" />
                <div>
                  <div className="font-medium">Удалить у меня</div>
                  <div className="text-sm opacity-75">Сообщение будет удалено только у вас</div>
                </div>
              </button>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowMessageMenu(false)}
                className="flex-1 px-4 py-2 text-mono-600 hover:bg-mono-100 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
