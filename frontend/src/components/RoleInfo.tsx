import React from 'react'
import { useAuthStore } from '../stores/authStore'
import { Shield, User, Calculator, Settings, Truck, Eye, Info } from 'lucide-react'

interface RoleInfo {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  permissions: string[]
}

const roleInfo: Record<string, RoleInfo> = {
  admin: {
    id: 'admin',
    name: 'Администратор',
    icon: Shield,
    description: 'Полный доступ ко всем функциям системы',
    permissions: [
      'Управление пользователями',
      'Настройка системы',
      'Просмотр всех отчетов',
      'Управление справочниками',
      'Контроль всех операций'
    ]
  },
  director: {
    id: 'director',
    name: 'Директор',
    icon: User,
    description: 'Управление и контроль бизнес-процессов',
    permissions: [
      'Просмотр всех отчетов',
      'Управление заказами',
      'Контроль финансов',
      'Управление персоналом',
      'Аналитика и планирование'
    ]
  },
  accountant: {
    id: 'accountant',
    name: 'Бухгалтер',
    icon: Calculator,
    description: 'Финансовый учет и отчетность',
    permissions: [
      'Учет финансовых операций',
      'Формирование отчетов',
      'Контроль платежей',
      'Управление ценами',
      'Налоговая отчетность'
    ]
  },
  dispatcher: {
    id: 'dispatcher',
    name: 'Диспетчер',
    icon: Settings,
    description: 'Координация операций и управление заявками',
    permissions: [
      'Управление заявками',
      'Планирование заказов',
      'Координация водителей',
      'Контроль выполнения',
      'Связь с клиентами'
    ]
  },
  driver: {
    id: 'driver',
    name: 'Водитель',
    icon: Truck,
    description: 'Работа с накладными и взвешиванием',
    permissions: [
      'Просмотр заданий',
      'Взвешивание груза',
      'Создание накладных',
      'Отчеты о работе',
      'Связь с диспетчером'
    ]
  },
  developer: {
    id: 'developer',
    name: 'Разработчик',
    icon: Eye,
    description: 'Тестирование и отладка системы',
    permissions: [
      'Доступ ко всем функциям',
      'Тестирование ролей',
      'Отладка системы',
      'Просмотр логов',
      'Техническая поддержка'
    ]
  }
}

export default function RoleInfo() {
  const { user } = useAuthStore()
  
  if (!user) return null

  const currentRole = roleInfo[user.role] || roleInfo.developer
  const IconComponent = currentRole.icon

  return (
    <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-mono-100 rounded-lg flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-mono-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-mono-900">
              {currentRole.name}
            </h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mono-100 text-mono-800">
              Текущая роль
            </span>
          </div>
          <p className="text-sm text-mono-600 mb-2">
            {currentRole.description}
          </p>
          <div className="space-y-1">
            <div className="text-xs font-medium text-mono-700 mb-1">
              Доступные функции:
            </div>
            <div className="flex flex-wrap gap-1">
              {currentRole.permissions.slice(0, 3).map((permission, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-mono-100 text-mono-700"
                >
                  {permission}
                </span>
              ))}
              {currentRole.permissions.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-mono-100 text-mono-500">
                  +{currentRole.permissions.length - 3} еще
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Info className="h-4 w-4 text-mono-400" />
        </div>
      </div>
    </div>
  )
}
