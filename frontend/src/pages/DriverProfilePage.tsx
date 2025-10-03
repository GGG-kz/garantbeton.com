import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types/auth'
import { Driver } from '../types/directories'
import { useLocalStorage } from '../hooks/useLocalStorage'
import PageLayout from '../components/PageLayout'
import { User, Phone, Key, Shield, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react'

export default function DriverProfilePage() {
  const { user } = useAuthStore()
  const [drivers, setDrivers] = useLocalStorage<Driver[]>('drivers', [])
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null)
  const [isEditingStatus, setIsEditingStatus] = useState(false)

  // Находим текущего водителя по логину
  useEffect(() => {
    if (user?.login) {
      const driver = drivers.find(d => d.login === user.login)
      setCurrentDriver(driver || null)
    }
  }, [user, drivers])

  const handleStatusChange = (newStatus: Driver['status']) => {
    if (!currentDriver) return

    const updatedDriver = { ...currentDriver, status: newStatus, updatedAt: new Date().toISOString() }
    setDrivers(prev => prev.map(d => d.id === currentDriver.id ? updatedDriver : d))
    setCurrentDriver(updatedDriver)
    setIsEditingStatus(false)
  }

  const getStatusInfo = (status: Driver['status']) => {
    const statusConfig = {
      active: {
        label: 'Доступен',
        icon: CheckCircle,
        color: 'text-mono-600',
        bgColor: 'bg-mono-50',
        description: 'Готов к работе'
      },
      vacation: {
        label: 'В отпуске',
        icon: Clock,
        color: 'text-black',
        bgColor: 'bg-mono-50',
        description: 'Находится в отпуске'
      },
      sick: {
        label: 'На больничном',
        icon: AlertTriangle,
        color: 'text-mono-600',
        bgColor: 'bg-yellow-50',
        description: 'На больничном листе'
      },
      inactive: {
        label: 'Неактивен',
        icon: XCircle,
        color: 'text-mono-600',
        bgColor: 'bg-mono-50',
        description: 'Временно недоступен'
      }
    }
    return statusConfig[status]
  }

  if (!user || user.role !== UserRole.DRIVER) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-mono-900 mb-4">Доступ запрещен</h1>
          <p className="text-mono-600">Эта страница доступна только водителям</p>
        </div>
      </div>
    )
  }

  if (!currentDriver) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-mono-900 mb-4">Водитель не найден</h1>
          <p className="text-mono-600">Информация о водителе не найдена в системе</p>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(currentDriver.status)
  const StatusIcon = statusInfo.icon

  return (
    <PageLayout
      title="Личный кабинет водителя"
      subtitle="Управление статусом и личной информацией"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Профиль */}
          <div className="bg-white rounded-lg border border-mono-200 p-6">
            <h3 className="text-lg font-semibold text-mono-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Личная информация
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">ФИО</label>
                <p className="text-sm text-mono-900">{currentDriver.fullName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Телефон
                </label>
                <p className="text-sm text-mono-900">{currentDriver.phone}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1 flex items-center">
                  <Key className="h-4 w-4 mr-1" />
                  Логин
                </label>
                <p className="text-sm text-mono-900">{currentDriver.login}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Дата создания</label>
                <p className="text-sm text-mono-900">
                  {new Date(currentDriver.createdAt).toLocaleDateString('kk-KZ')}
                </p>
              </div>
            </div>
          </div>

          {/* Статус */}
          <div className="bg-white rounded-lg border border-mono-200 p-6">
            <h3 className="text-lg font-semibold text-mono-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary-600" />
              Текущий статус
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
                  <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
                </div>
                <div>
                  <p className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
                  <p className="text-sm text-mono-600">{statusInfo.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditingStatus(!isEditingStatus)}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200"
              >
                Изменить
              </button>
            </div>

            {/* Форма изменения статуса */}
            {isEditingStatus && (
              <div className="mt-6 p-4 bg-mono-50 rounded-lg">
                <h4 className="text-sm font-medium text-mono-900 mb-3">Выберите новый статус:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['active', 'vacation', 'sick', 'inactive'] as const).map((status) => {
                    const info = getStatusInfo(status)
                    const Icon = info.icon
                    const isSelected = status === currentDriver.status
                    
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={isSelected}
                        className={`p-3 rounded-lg border-2 transition-colors duration-200 flex items-center space-x-3 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-mono-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${info.color}`} />
                        <div className="text-left">
                          <p className={`text-sm font-medium ${info.color}`}>{info.label}</p>
                          <p className="text-xs text-mono-600">{info.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditingStatus(false)}
                    className="px-3 py-2 text-sm text-mono-600 hover:text-mono-800"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Закрепленный транспорт */}
          {currentDriver.vehicleIds.length > 0 && (
            <div className="bg-white rounded-lg border border-mono-200 p-6">
              <h3 className="text-lg font-semibold text-mono-900 mb-4">Закрепленный транспорт</h3>
              <div className="space-y-2">
                {currentDriver.vehicleIds.map((vehicleId, index) => (
                  <div key={vehicleId} className="flex items-center justify-between p-3 bg-mono-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-mono-900">Транспорт #{index + 1}</p>
                      <p className="text-xs text-mono-600">ID: {vehicleId}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Быстрые действия */}
          <div className="bg-white rounded-lg border border-mono-200 p-6">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">Быстрые действия</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatusChange('active')}
                disabled={currentDriver.status === 'active'}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-mono-700 bg-mono-50 hover:bg-mono-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Отметить как доступен</span>
              </button>
              
              <button
                onClick={() => handleStatusChange('vacation')}
                disabled={currentDriver.status === 'vacation'}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-black bg-mono-50 hover:bg-mono-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="h-4 w-4" />
                <span>Уйти в отпуск</span>
              </button>
              
              <button
                onClick={() => handleStatusChange('sick')}
                disabled={currentDriver.status === 'sick'}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Взять больничный</span>
              </button>
            </div>
          </div>

          {/* Информация о пароле */}
          <div className="bg-white rounded-lg border border-mono-200 p-6">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">Безопасность</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">Временный пароль</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {currentDriver.hasChangedPassword 
                    ? 'Пароль был изменен' 
                    : 'Рекомендуется сменить временный пароль'
                  }
                </p>
              </div>
              
              {!currentDriver.hasChangedPassword && (
                <button className="w-full px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200">
                  Сменить пароль
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
