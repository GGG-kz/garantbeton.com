import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types/auth'
import { ChevronDown, Shield, Settings, BarChart3, Truck, Package, Calculator, Users, Monitor, ChefHat, User as UserIcon } from 'lucide-react'

const roles = [
  { id: UserRole.DEVELOPER, label: 'Разработчик', icon: Shield, description: 'Полный доступ, переключение ролей' },
  { id: UserRole.ADMIN, label: 'Администратор', icon: Settings, description: 'Управление пользователями и системой' },
  { id: UserRole.DIRECTOR, label: 'Директор', icon: Users, description: 'Общее руководство и стратегическое планирование' },
  { id: UserRole.MANAGER, label: 'Менеджер', icon: BarChart3, description: 'Управление производством и планированием заказов' },
  { id: UserRole.DISPATCHER, label: 'Диспетчер', icon: Truck, description: 'Координация доставки и управление транспортом' },
  { id: UserRole.DRIVER, label: 'Водитель', icon: Truck, description: 'Управление доставкой и отслеживание маршрутов' },
  { id: UserRole.SUPPLY, label: 'Снабженец', icon: Package, description: 'Управление поставками сырья и материалов' },
  { id: UserRole.ACCOUNTANT, label: 'Бухгалтер', icon: Calculator, description: 'Финансовый учет и отчетность' },
  { id: UserRole.OPERATOR, label: 'Оператор', icon: Monitor, description: 'Работа с материалами, марками бетона, заявками и мессенджером' },
  { id: UserRole.COOK, label: 'Повар', icon: ChefHat, description: 'Подача заявок на продукты и инвентарь, доступ к мессенджеру' },
  { id: UserRole.USER, label: 'Пользователь', icon: UserIcon, description: 'Базовый доступ к системе' },
]

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentRole = roles.find(role => role.id === user?.role) || roles[0]
  const IconComponent = currentRole.icon

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleRoleChange = (roleId: string) => {
    if (user) {
      console.log('RoleSwitcher: Attempting to switch to role:', roleId)
      console.log('RoleSwitcher: Current user state before switch:', {
        user: user?.login,
        currentRole: user?.role,
        originalRole: user?.originalRole
      })
      const { switchRole } = useAuthStore.getState()
      switchRole(roleId as UserRole)
      setIsOpen(false)
    }
  }

  // Отладочная информация
  console.log('RoleSwitcher debug:', {
    user: user?.login,
    userRole: user?.role,
    originalRole: user?.originalRole,
    isDeveloper: user?.role === UserRole.DEVELOPER,
    shouldShow: user && user.role === UserRole.DEVELOPER
  })

  // Проверяем, является ли пользователь разработчиком ТОЛЬКО по исходной роли
  const isDeveloper = user?.originalRole === UserRole.DEVELOPER
  
  console.log('RoleSwitcher debug:', {
    user: user?.login,
    currentRole: user?.role,
    originalRole: user?.originalRole,
    isDeveloper,
    userRoleEnum: UserRole.DEVELOPER,
    comparison: user?.originalRole === UserRole.DEVELOPER
  })
  
  if (!user) {
    console.log('RoleSwitcher: Not showing - no user')
    return null
  }
  
  // Показываем переключатель только разработчикам
  const shouldShow = isDeveloper
  
  if (!shouldShow) {
    console.log('RoleSwitcher: Not showing - not a developer. Current role:', user.role, 'Original role:', user.originalRole)
    return null
  }
  
  console.log('RoleSwitcher: Showing for user:', user.login, 'current role:', user.role, 'original role:', user.originalRole)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 text-sm font-medium border-2 border-red-700"
      >
        <IconComponent className="h-4 w-4" />
        <span>DEBUG: {currentRole.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-mono-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role.id)}
                className={`w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-200
                  ${user.role === role.id ? 'bg-mono-600 text-white' : 'text-mono-700 hover:bg-mono-100'}
                `}
              >
                <role.icon className="h-4 w-4" />
                <div>
                  <span className="block text-sm font-medium">{role.label}</span>
                  <span className="block text-xs text-mono-500">{role.description}</span>
                </div>
              </button>
            ))}
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