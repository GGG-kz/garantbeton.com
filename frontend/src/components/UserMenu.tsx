import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types/auth'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  const handleProfile = () => {
    // Для водителей перенаправляем в личный кабинет водителя
    if (user.role === UserRole.DRIVER) {
      navigate('/driver-profile')
    } else {
      navigate('/profile')
    }
    setIsOpen(false)
  }

  const handleSettings = () => {
    navigate('/settings')
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  const getInitials = (name?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user.login.slice(0, 2).toUpperCase()
  }

  const displayName = user.fullName || user.login

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 bg-white hover:bg-mono-100 rounded-lg border-2 border-mono-300 hover:border-black transition-all duration-200"
      >
        {/* Аватар */}
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {getInitials(user.fullName)}
              </span>
            </div>
          )}
        </div>

        {/* Имя пользователя */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-black">
            {displayName}
          </span>
          <span className="text-xs text-mono-500">
            {user.role}
          </span>
        </div>

        <ChevronDown className="h-4 w-4 text-black" />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-large border-2 border-mono-300 z-20">
            <div className="py-1">
              {/* Профиль */}
              <button
                onClick={handleProfile}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-black hover:bg-mono-100 transition-colors duration-200"
              >
                <User className="h-4 w-4" />
                <span>Профиль</span>
              </button>

              {/* Настройки */}
              <button
                onClick={handleSettings}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-black hover:bg-mono-100 transition-colors duration-200"
              >
                <Settings className="h-4 w-4" />
                <span>Настройки</span>
              </button>

              {/* Разделитель */}
              <div className="border-t border-mono-200 my-1" />

              {/* Выход */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-black hover:bg-mono-200 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
