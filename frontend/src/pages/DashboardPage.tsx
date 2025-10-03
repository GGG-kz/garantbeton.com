import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types/auth'
import RoleSwitcher from '../components/RoleSwitcher'
import UserMenu from '../components/UserMenu'
import ResponsiveLayout from '../components/ResponsiveLayout'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDirectoryStats } from '../hooks/useDirectoryStats'
import { useNotifications } from '../hooks/useNotifications'
import { InternalRequest } from '../types/requests'
import { hardRefresh, clearBrowserCache } from '../utils/forceRefresh'
import { clearSpecificData, checkSpecificData } from '../utils/clearSpecificData'
import { nuclearClear, checkAllData, forceRefresh } from '../utils/nuclearClear'
import { clearPwaCache, checkPwaCache, forceClearAll } from '../utils/clearPwaCache'
import { forceUpdateCache, APP_VERSION } from '../version'
import { exportAllData, importAllData, clearAllData } from '../utils/dataExport'
import NotificationCenter from '../components/NotificationCenter'
import { 
  User, 
  Settings, 
  Truck, 
  Package, 
  Calculator,
  Users,
  BarChart3,
  Shield,
  Database,
  DollarSign,
  FileText,
  MessageCircle,
  ShoppingCart,
  Monitor,
  ChefHat,
  Receipt,
  RefreshCw,
  Bell
} from 'lucide-react'

const getRoleInfo = (role: UserRole) => {
  switch (role) {
    case UserRole.DEVELOPER:
      return {
        title: 'Разработчик',
        description: 'Полный доступ к системе с возможностью переключения ролей',
        icon: Shield,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.ADMIN:
      return {
        title: 'Администратор',
        description: 'Управление пользователями и системными настройками',
        icon: Settings,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.MANAGER:
      return {
        title: 'Менеджер',
        description: 'Управление производством и планированием заказов',
        icon: BarChart3,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.DISPATCHER:
      return {
        title: 'Диспетчер',
        description: 'Координация доставки и управление транспортом',
        icon: Truck,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.DRIVER:
      return {
        title: 'Водитель',
        description: 'Управление доставкой и отслеживание маршрутов',
        icon: Truck,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.SUPPLY:
      return {
        title: 'Снабженец',
        description: 'Управление поставками сырья и материалов',
        icon: Package,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.ACCOUNTANT:
      return {
        title: 'Бухгалтер',
        description: 'Финансовый учет и отчетность',
        icon: Calculator,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.DIRECTOR:
      return {
        title: 'Директор',
        description: 'Общее руководство и стратегическое планирование',
        icon: Users,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.OPERATOR:
      return {
        title: 'Оператор',
        description: 'Работа с материалами, марками бетона, заявками и мессенджером',
        icon: Monitor,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    case UserRole.COOK:
      return {
        title: 'Повар',
        description: 'Подача заявок на продукты и инвентарь, доступ к мессенджеру',
        icon: ChefHat,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
    default:
      return {
        title: 'Пользователь',
        description: 'Базовый доступ к системе',
        icon: User,
        color: 'text-black',
        bgColor: 'bg-mono-100',
      }
  }
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [requests] = useLocalStorage<InternalRequest[]>('internalRequests', [])
  const stats = useDirectoryStats()
  const { unreadCount, addNotification } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)

  if (!user) {
    return null
  }

  // Проверяем, есть ли у пользователя заявки
  const hasRequests = requests.some(request => request.userId === user.id)
  
  // Определяем, является ли пользователь руководителем
  const isManager = ['director', 'accountant', 'supply', 'developer'].includes(user.role)

  const roleInfo = getRoleInfo(user.role)
  const IconComponent = roleInfo.icon

  return (
    <ResponsiveLayout>
      {/* Desktop Header - скрыт на мобильных */}
      <div className="hidden md:block">
        <header className="bg-white border-b-2 border-black mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-black">
                  Бетонный завод
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Кнопка уведомлений */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-mono-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-mono-500 focus:ring-offset-2 rounded-lg hover:bg-mono-100 transition-all duration-300"
                  title="Уведомления"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                <RoleSwitcher />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-black">Главная</h1>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 text-mono-600 hover:text-black rounded-lg"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Info Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${roleInfo.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${roleInfo.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    {roleInfo.title}
                  </h2>
                  <p className="text-sm text-mono-500">
                    {user.login}
                  </p>
                </div>
              </div>
              
              <p className="text-mono-600 text-sm leading-relaxed">
                {roleInfo.description}
              </p>
              
              {user.role === UserRole.DEVELOPER && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-mono-50 border-2 border-mono-200 rounded-lg">
                    <p className="text-sm text-mono-700">
                      Используйте переключатель ролей выше для тестирования разных интерфейсов
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addNotification({
                        title: 'Тестовое уведомление',
                        message: 'Это тестовое уведомление для проверки работы системы уведомлений',
                        type: 'info',
                        userId: user.id,
                        role: user.role,
                        priority: 'medium'
                      })
                    }}
                    className="w-full btn-primary btn-sm"
                  >
                    Тест уведомления
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Принудительно обновить кэш приложения? Это очистит все кэши и перезагрузит страницу.')) {
                        forceUpdateCache()
                      }
                    }}
                    className="w-full btn-danger btn-sm"
                  >
                    Принудительное обновление
                  </button>
                  
                  <div className="border-t border-mono-200 pt-3 mt-3">
                    <h4 className="text-sm font-medium text-mono-700 mb-2">Синхронизация данных</h4>
                    <button
                      onClick={() => {
                        const result = exportAllData()
                        alert(result)
                      }}
                      className="w-full btn-success btn-sm mb-2"
                    >
                      Экспорт данных
                    </button>
                    <button
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.json'
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) {
                            const result = await importAllData(file)
                            alert(result)
                            if (result.includes('успешно')) {
                              window.location.reload()
                            }
                          }
                        }
                        input.click()
                      }}
                      className="w-full btn-primary btn-sm mb-2"
                    >
                      Импорт данных
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Очистить ВСЕ данные приложения? Это действие необратимо!')) {
                          const result = clearAllData()
                          alert(result)
                          window.location.reload()
                        }
                      }}
                      className="w-full btn-danger btn-sm"
                    >
                      Очистить все данные
                    </button>
                  </div>
                  
                  <div className="text-xs text-mono-500 text-center mt-3">
                    Версия: {APP_VERSION}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">
                  Добро пожаловать в систему!
                </h3>
                <button
                  onClick={() => {
                    clearBrowserCache()
                    window.location.reload()
                  }}
                  className="btn-primary btn-sm flex items-center space-x-2"
                  title="Принудительно обновить данные и очистить кэш"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Обновить</span>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="card-primary">
                  <h4 className="font-medium text-black mb-2">
                    Система успешно запущена!
                  </h4>
                  <p className="text-sm text-mono-700">
                    Вы успешно вошли в систему автоматизации бетонного завода. 
                    Интерфейс адаптирован под вашу роль: <strong>{roleInfo.title}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => navigate('/directories')}
                    className="dashboard-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Database className="dashboard-card-icon" />
                        <h4 className="dashboard-card-title">Справочники</h4>
                      </div>
                      <div className="dashboard-card-badge">
                        Временно недоступно
                      </div>
                    </div>
                    <p className="text-sm text-mono-700">
                      Управление контрагентами, материалами, транспортом и другой номенклатурой
                    </p>
                  </div>




                  {/* Карточка заказов бетона - доступна только менеджеру, директору, диспетчеру и бухгалтеру */}
                  {(user.role === UserRole.MANAGER || user.role === UserRole.DIRECTOR || user.role === UserRole.DISPATCHER || user.role === UserRole.ACCOUNTANT) && (
                    <div
                      onClick={() => navigate('/orders')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Заказы бетона</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Создание и управление заказами на производство и доставку бетона
                      </p>
                    </div>
                  )}

                  {/* Карточка расходных накладных - доступна только диспетчеру */}
                  {user.role === UserRole.DISPATCHER && (
                    <div
                      onClick={() => navigate('/expense-invoices')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Receipt className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Расходные накладные</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Создание и печать расходных накладных для отгрузки товара
                      </p>
                    </div>
                  )}

                  {/* Карточка приходных накладных - доступна только диспетчеру */}
                  {user.role === UserRole.DISPATCHER && (
                    <div
                      onClick={() => navigate('/receipt-invoices')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Приходные накладные</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Создание и печать приходных накладных для поступления товара
                      </p>
                    </div>
                  )}

                  {/* Карточка накладных для водителя - доступна только водителю */}
                  {user.role === UserRole.DRIVER && (
                    <div
                      onClick={() => navigate('/driver-invoices')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Truck className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Мои накладные</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Просмотр накладных для доставки и маршрутная информация
                      </p>
                    </div>
                  )}

                  {/* Карточка приходных накладных для водителя - доступна только водителю */}
                  {user.role === UserRole.DRIVER && (
                    <div
                      onClick={() => navigate('/driver-receipt-invoices')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Приходные накладные</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Создание приходных накладных и взвешивание материалов
                      </p>
                    </div>
                  )}

                  {/* Карточка внутренних заявок - доступна всем пользователям */}
                  <div
                    onClick={() => navigate('/requests')}
                    className="dashboard-card"
                  >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Внутренние заявки</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Создание и управление заявками на внутренние нужды
                      </p>
                  </div>

                  {/* Карточка мессенджера - доступна всем пользователям */}
                  <div
                    onClick={() => navigate('/messenger')}
                    className="dashboard-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="dashboard-card-icon" />
                        <h4 className="dashboard-card-title">Мессенджер</h4>
                      </div>
                    </div>
                    <p className="text-sm text-mono-700">
                      Внутренняя система общения между сотрудниками
                    </p>
                  </div>

                  {/* Карточка управления пользователями - только для администратора */}
                  {user.role === UserRole.ADMIN && (
                    <div
                      onClick={() => navigate('/admin/users')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Пользователи</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Управление пользователями системы: создание, блокировка, редактирование
                      </p>
                    </div>
                  )}

                  {/* Карточка отчётов - только для администратора */}
                  {user.role === UserRole.ADMIN && (
                    <div
                      onClick={() => navigate('/admin/reports')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Отчёты</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Системные отчёты: активность пользователей, блокировки, аудит действий
                      </p>
                    </div>
                  )}

                  {/* Карточка цен - только для бухгалтера, директора и снабженца */}
                  {(user.role === 'accountant' || user.role === 'director' || user.role === 'supply') && (
                    <div
                      onClick={() => navigate('/prices')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Цены</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Управление ценами для контрагентов на марки бетона и материалы
                      </p>
                    </div>
                  )}

                  {/* Карточка управления ценами услуг - доступна менеджеру, директору и бухгалтеру */}
                  {(user.role === 'manager' || user.role === 'director' || user.role === 'accountant') && (
                    <div
                      onClick={() => navigate('/service-prices')}
                      className="dashboard-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Settings className="dashboard-card-icon" />
                          <h4 className="dashboard-card-title">Цены услуг</h4>
                        </div>
                      </div>
                      <p className="text-sm text-mono-700">
                        Управление ценами на дополнительные услуги (насос, добавки, доставка)
                      </p>
                    </div>
                  )}
                  
                </div>


                {user.role === UserRole.DEVELOPER && (
                  <div className="space-y-4">
                    <div className="p-4 bg-mono-50 border-2 border-mono-200 rounded-lg">
                      <h4 className="font-medium text-black mb-2">
                        Режим разработчика
                      </h4>
                      <p className="text-sm text-mono-700 mb-3">
                        У вас есть доступ к переключению ролей для тестирования различных сценариев использования.
                        Попробуйте переключиться на другую роль с помощью выпадающего меню в шапке.
                      </p>
                      
                      {/* Кнопки для очистки данных */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              const count = checkSpecificData()
                              alert(`Найдено данных: ${count} записей. См. консоль для деталей.`)
                            }}
                            className="btn-secondary btn-xs"
                          >
                            Проверить конкретные данные
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm('Удалить данные из изображений (цены, услуги, заявки)?')) {
                                const removed = clearSpecificData()
                                alert(`Удалено ${removed} ключей. Страница обновится через секунду.`)
                                setTimeout(() => window.location.reload(), 1000)
                              }
                            }}
                            className="btn-danger btn-xs"
                          >
                            Очистить данные из изображений
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              const count = checkAllData()
                              alert(`ВСЕГО данных в системе: ${count} записей. См. консоль для деталей.`)
                            }}
                            className="btn-secondary btn-xs"
                          >
                            Проверить ВСЕ данные
                          </button>
                          
                          <button
                            onClick={async () => {
                              await checkPwaCache()
                              alert('Проверка PWA кэша завершена. См. консоль для деталей.')
                            }}
                            className="btn-secondary btn-xs"
                          >
                            Проверить PWA кэш
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              if (confirm('ЯДЕРНАЯ ОЧИСТКА! Удалить ВСЕ данные кроме авторизации? Это действие нельзя отменить!')) {
                                if (confirm('Вы уверены? Это удалит ВСЕ данные из системы!')) {
                                  const removed = nuclearClear()
                                  alert(`ЯДЕРНАЯ ОЧИСТКА ЗАВЕРШЕНА! Удалено ${removed} ключей. Страница обновится.`)
                                  setTimeout(() => window.location.reload(), 2000)
                                }
                              }
                            }}
                            className="btn-danger btn-xs font-bold"
                          >
                            ЯДЕРНАЯ ОЧИСТКА
                          </button>
                          
                          <button
                            onClick={async () => {
                              if (confirm('ОЧИСТКА PWA КЭША! Удалить все кэши, Service Worker и данные? Это решит проблему с восстановлением данных!')) {
                                if (confirm('Вы уверены? Это удалит ВСЕ кэши и данные!')) {
                                  await clearPwaCache()
                                  alert('PWA КЭШ ОЧИЩЕН! Страница обновится.')
                                }
                              }
                            }}
                            className="btn-danger btn-xs font-bold"
                          >
                            ОЧИСТИТЬ PWA КЭШ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </ResponsiveLayout>
  )
}
