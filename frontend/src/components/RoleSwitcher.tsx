import React, { useState } from 'react'
import { ChevronDown, User, Shield, Calculator, Truck, Settings, Eye } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface Role {
  id: string
  name: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const roles: Role[] = [
  {
    id: 'admin',
    name: 'Администратор',
    label: 'Админ',
    icon: Shield,
    description: 'Полный доступ ко всем функциям'
  },
  {
    id: 'director',
    name: 'Директор',
    label: 'Директор',
    icon: User,
    description: 'Управление и контроль'
  },
  {
    id: 'accountant',
    name: 'Бухгалтер',
    label: 'Бухгалтер',
    icon: Calculator,
    description: 'Финансы и отчеты'
  },
  {
    id: 'dispatcher',
    name: 'Диспетчер',
    label: 'Диспетчер',
    icon: Settings,
    description: 'Управление заявками и заказами'
  },
  {
    id: 'driver',
    name: 'Водитель',
    label: 'Водитель',
    icon: Truck,
    description: 'Работа с накладными и взвешиванием'
  },
  {
    id: 'developer',
    name: 'Разработчик',
    label: 'Dev',
    icon: Eye,
    description: 'Тестирование и отладка'
  }
]

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()

  const currentRole = roles.find(role => role.id === user?.role) || roles[0]
  const IconComponent = currentRole.icon

  const handleRoleChange = (roleId: string) => {
    if (user) {
      // Используем switchRole из authStore
      const { switchRole } = useAuthStore.getState()
      switchRole(roleId as any)
      setIsOpen(false)
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
        title="Переключить роль для тестирования"
      >
        <IconComponent className="h-4 w-4 text-mono-600" />
        <span className="text-sm font-medium text-mono-700">
          {currentRole.label}
        </span>
        <ChevronDown className={`h-4 w-4 text-mono-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-mono-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-mono-500 mb-2 px-2">
              Переключение роли для тестирования
            </div>
            {roles.map((role) => {
              const RoleIcon = role.icon
              const isActive = role.id === user?.role
              
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-mono-100 text-mono-900' 
                      : 'hover:bg-mono-50 text-mono-700'
                  }`}
                >
                  <RoleIcon className="h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{role.name}</div>
                    <div className="text-xs text-mono-500">{role.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-mono-600 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="border-t border-mono-200 p-2">
            <div className="text-xs text-mono-500 text-center">
              Текущий пользователь: {user.fullName || user.login}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}