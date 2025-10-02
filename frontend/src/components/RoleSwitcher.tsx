import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types/auth'
import { ChevronDown, User } from 'lucide-react'

const roleLabels: Record<UserRole, string> = {
  [UserRole.DEVELOPER]: 'Разработчик',
  [UserRole.ADMIN]: 'Администратор',
  [UserRole.MANAGER]: 'Менеджер',
  [UserRole.DISPATCHER]: 'Диспетчер',
  [UserRole.DRIVER]: 'Водитель',
  [UserRole.SUPPLY]: 'Снабженец',
  [UserRole.ACCOUNTANT]: 'Бухгалтер',
  [UserRole.DIRECTOR]: 'Директор',
  [UserRole.OPERATOR]: 'Оператор',
  [UserRole.COOK]: 'Повар',
}

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, originalRole, switchRole } = useAuthStore()

  // Показываем переключатель только если пользователь изначально был разработчиком
  if (!user || originalRole !== UserRole.DEVELOPER) {
    return null
  }

  const handleRoleChange = (role: UserRole) => {
    switchRole(role)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-mono-100 border-2 border-mono-300 hover:border-black rounded-lg transition-all duration-200"
      >
        <User className="h-4 w-4 text-black" />
        <span className="text-sm font-medium text-black">
          {roleLabels[user.role]} {originalRole === UserRole.DEVELOPER && user.role !== UserRole.DEVELOPER && '(разработчик)'}
        </span>
        <ChevronDown className="h-4 w-4 text-black" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-large border-2 border-mono-300 z-20">
            <div className="py-1">
              {Object.entries(roleLabels).map(([role, label]) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role as UserRole)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-mono-100 transition-colors duration-200 ${
                    user.role === role ? 'bg-black text-white' : 'text-black'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
