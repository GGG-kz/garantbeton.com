import { useState } from 'react'
import { Chat, ChatParticipant } from '../../types/messenger'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { MessageCircle, Users, Plus, Search } from 'lucide-react'

interface ChatListProps {
  chats: Chat[]
  onChatSelect: (chat: Chat) => void
  selectedChatId?: string
  currentUserId: string
  isMobile?: boolean
}


export default function ChatList({ chats, onChatSelect, selectedChatId, currentUserId, isMobile = false }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      p.id !== currentUserId
    )
  )

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short' 
      })
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name
    }
    
    // Для личных чатов показываем имя собеседника
    const otherParticipant = chat.participants.find(p => p.id !== currentUserId)
    return otherParticipant?.name || chat.name
  }

  const getChatIcon = (chat: Chat, isSelected: boolean) => {
    const iconClass = isSelected ? "h-5 w-5 text-black" : "h-5 w-5 text-mono-600";
    return chat.type === 'group' ? (
      <Users className={iconClass} />
    ) : (
      <MessageCircle className={iconClass} />
    )
  }

  return (
    <div className={`w-full ${isMobile ? '' : 'md:w-80'} bg-white ${isMobile ? '' : 'border-r border-mono-200'} flex flex-col h-full`}>
      {/* Header */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-mono-200 bg-mono-50`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-black`}>Чаты</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="btn-ghost p-2.5 rounded-xl mobile-touch-target"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-mono-500 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-mono-100 rounded-2xl flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-mono-400" />
            </div>
            <p className="text-sm font-semibold text-mono-700">Нет чатов</p>
            <p className="text-xs text-mono-500 mt-1">
              Создайте новый чат или дождитесь сообщений
            </p>
          </div>
        ) : (
          <div className={`${isMobile ? 'space-y-0' : 'space-y-1'} ${isMobile ? 'p-0' : 'p-2'}`}>
            {filteredChats.map((chat, index) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`group ${isMobile ? 'p-4 border-b border-mono-100' : 'p-4 rounded-lg'} cursor-pointer transition-all duration-300 mobile-touch-target animate-slide-up ${
                  selectedChatId === chat.id
                    ? isMobile ? 'bg-mono-100' : 'bg-black text-white'
                    : isMobile ? 'hover:bg-mono-50 active:bg-mono-100' : 'hover:bg-mono-100 active:bg-mono-200'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={`${isMobile ? 'h-12 w-12 rounded-full' : 'h-12 w-12 rounded-lg'} flex items-center justify-center transition-all duration-300 ${
                      selectedChatId === chat.id 
                        ? isMobile ? 'bg-mono-600' : 'bg-white'
                        : isMobile ? 'bg-mono-200' : 'bg-mono-200 group-hover:bg-mono-300'
                    }`}>
                      {isMobile ? (
                        <span className="text-sm font-semibold text-white">
                          {getChatName(chat).charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        getChatIcon(chat, selectedChatId === chat.id)
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-semibold truncate ${
                        selectedChatId === chat.id ? 'text-white' : 'text-black'
                      }`}>
                        {getChatName(chat)}
                      </h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {chat.lastMessageAt && (
                          <span className="text-xs text-mono-500 font-medium">
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        )}
                        {chat.unreadCount > 0 && (
                          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full min-w-[20px] animate-bounce-soft ${
                            selectedChatId === chat.id 
                              ? 'bg-white text-black' 
                              : 'bg-black text-white'
                          }`}>
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {chat.lastMessage && (
                      <p className={`text-sm truncate ${
                        selectedChatId === chat.id ? 'text-mono-300' : 'text-mono-600'
                      }`}>
                        <span className={`font-medium ${
                          selectedChatId === chat.id ? 'text-mono-200' : 'text-mono-700'
                        }`}>
                          {chat.lastMessage.senderName}:
                        </span>{' '}
                        {chat.lastMessage.content}
                      </p>
                    )}

                    {/* Participants count for group chats */}
                    {chat.type === 'group' && (
                      <div className="flex items-center mt-2">
                        <Users className="h-3 w-3 text-mono-400 mr-1" />
                        <span className="text-xs text-mono-500 font-medium">
                          {chat.participants.length} участников
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
