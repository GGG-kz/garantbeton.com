import { useState } from 'react'
import { Chat, Message } from '../../types/messenger'
import ChatList from './ChatList'
import MessageList from './MessageList'

interface MobileMessengerLayoutProps {
  chats: Chat[]
  messages: Message[]
  selectedChat: Chat | null
  onChatSelect: (chat: Chat) => void
  onSendMessage: (content: string, replyTo?: string) => void
  currentUserId: string
}

export default function MobileMessengerLayout({
  chats,
  messages,
  selectedChat,
  onChatSelect,
  onSendMessage,
  currentUserId
}: MobileMessengerLayoutProps) {
  const [view, setView] = useState<'chats' | 'messages'>('chats')

  const handleChatSelect = (chat: Chat) => {
    onChatSelect(chat)
    setView('messages')
  }

  const handleBackToChats = () => {
    setView('chats')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-mono-200">
        <div className="flex">
          <button
            onClick={() => setView('chats')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
              view === 'chats'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-mono-500 hover:text-mono-700'
            }`}
          >
            Чаты
          </button>
          <button
            onClick={() => setView('messages')}
            disabled={!selectedChat}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
              view === 'messages' && selectedChat
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-mono-500 hover:text-mono-700 disabled:text-mono-300'
            }`}
          >
            {selectedChat ? selectedChat.name : 'Сообщения'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'chats' ? (
          <ChatList
            chats={chats}
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
            currentUserId={currentUserId}
          />
        ) : (
          <MessageList
            chat={selectedChat}
            messages={messages}
            onSendMessage={onSendMessage}
            onBackToChats={handleBackToChats}
          />
        )}
      </div>
    </div>
  )
}
