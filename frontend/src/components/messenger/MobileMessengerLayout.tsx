import { useState } from 'react'
import { Chat, Message } from '../../types/messenger'
import ChatList from './ChatList'
import MessageList from './MessageList'
import { ArrowLeft, MoreVertical } from 'lucide-react'

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
    <div className="h-screen flex flex-col bg-white relative">
      {/* WhatsApp-style Header */}
      {view === 'messages' && selectedChat ? (
        <div className="bg-mono-800 text-white px-4 py-3 flex items-center justify-between border-b border-mono-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToChats}
              className="p-2 hover:bg-mono-700 rounded-full transition-colors"
              title="Назад к списку чатов"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-mono-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {selectedChat.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedChat.name}</h3>
                <p className="text-xs text-mono-300 flex items-center">
                  {selectedChat.type === 'group' ? (
                    `${selectedChat.participants.length} участников`
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      В сети
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-mono-700 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="bg-mono-800 text-white px-4 py-3 flex items-center justify-between border-b border-mono-700">
          <h2 className="text-lg font-semibold">Чаты</h2>
          <button className="p-2 hover:bg-mono-700 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'chats' ? (
          <ChatList
            chats={chats}
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
            currentUserId={currentUserId}
            isMobile={true}
          />
        ) : (
          <MessageList
            chat={selectedChat}
            messages={messages}
            onSendMessage={onSendMessage}
            onBackToChats={handleBackToChats}
            isMobile={true}
          />
        )}
      </div>
    </div>
  )
}
