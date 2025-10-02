import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import PageLayout from '../../components/PageLayout'
import { useSingleDirectoryStats } from '../../hooks/useDirectoryStats'
// Функции clearAllDirectoryData, checkLocalStorageData, clearEntireSystem были удалены - тестовые данные очищены
import { clearBrowserCache } from '../../utils/forceRefresh'
import { 
  Building2, 
  Layers, 
  Warehouse, 
  Package, 
  Users, 
  Truck,
  ArrowRight,
  Database,
  Lock,
  Monitor,
  ChefHat,
  Trash2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface DirectoryItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  color: string
  bgColor: string
  allowedRoles: string[] // Роли, которым доступен этот справочник
  storageKey: string // Ключ в localStorage
  stats?: {
    total: number
    active: number
  }
}

const directories: DirectoryItem[] = [
  {
    id: 'counterparties',
    title: 'Контрагенты',
    description: 'Клиенты и поставщики',
    icon: Building2,
    path: '/directories/counterparties',
    color: 'text-black',
    bgColor: 'bg-mono-100',
    allowedRoles: ['developer', 'admin', 'manager', 'dispatcher', 'supply', 'accountant', 'director'],
    storageKey: 'counterparties'
  },
  {
    id: 'concrete-grades',
    title: 'Марки бетона',
    description: 'Номенклатура бетонных смесей',
    icon: Layers,
    path: '/directories/concrete-grades',
    color: 'text-mono-600',
    bgColor: 'bg-mono-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'supply', 'accountant', 'director', 'operator'],
    storageKey: 'concreteGrades'
  },
  {
    id: 'warehouses',
    title: 'Склады',
    description: 'Складские помещения и запасы',
    icon: Warehouse,
    path: '/directories/warehouses',
    color: 'text-mono-600',
    bgColor: 'bg-mono-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'supply', 'accountant', 'director'],
    storageKey: 'warehouses'
  },
  {
    id: 'materials',
    title: 'Материалы',
    description: 'Сырье и компоненты',
    icon: Package,
    path: '/directories/materials',
    color: 'text-mono-600',
    bgColor: 'bg-mono-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'supply', 'accountant', 'director', 'operator'],
    storageKey: 'materials'
  },
  {
    id: 'drivers',
    title: 'Водители',
    description: 'Персонал водителей',
    icon: Users,
    path: '/directories/drivers',
    color: 'text-mono-600',
    bgColor: 'bg-mono-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'accountant', 'director'],
    storageKey: 'drivers'
  },
  {
    id: 'vehicles',
    title: 'Транспорт',
    description: 'Автобетоносмесители и самосвалы',
    icon: Truck,
    path: '/directories/vehicles',
    color: 'text-mono-600',
    bgColor: 'bg-mono-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'accountant', 'director'],
    storageKey: 'vehicles'
  }
]

export default function DirectoriesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Фильтруем справочники по роли пользователя и добавляем динамическую статистику
  const availableDirectories = directories
    .filter(directory => !user || directory.allowedRoles.includes(user.role))
    .map(directory => ({
      ...directory,
      stats: useSingleDirectoryStats(directory.storageKey)
    }))

  const handleDirectoryClick = (path: string) => {
    navigate(path)
  }

  const handleClearAllData = () => {
    if (window.confirm(
      '⚠️ ВНИМАНИЕ! Это действие удалит ВСЕ данные из всех справочников.\n\n' +
      'Это действие необратимо!\n\n' +
      'Вы уверены, что хотите продолжить?'
    )) {
      // Очистка данных справочников
      const keysToRemove = [
        'counterparties', 'concreteGrades', 'warehouses', 'materials', 
        'drivers', 'vehicles', 'orders', 'expenseInvoices', 'internalRequests'
      ]
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log(`Удален ключ: ${key}`)
      })
      
      // Принудительно обновляем страницу для применения изменений
      window.location.reload()
    }
  }

  // Если пользователь не авторизован, показываем сообщение
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-mono-900 mb-4">Доступ запрещен</h1>
          <p className="text-mono-600">Необходимо войти в систему</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="Справочники"
      subtitle="Управление номенклатурой и базовыми данными системы"
    >
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Database className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-mono-900">Справочники</h2>
              <p className="text-mono-600">Базовая информация для работы системы</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Кнопка обновления данных */}
            <button
              onClick={() => {
                clearBrowserCache()
                window.location.reload()
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-mono-50 hover:bg-mono-100 border border-mono-200 text-black rounded-lg transition-colors duration-200"
              title="Принудительно обновить данные и очистить кэш браузера"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Обновить данные</span>
            </button>

            {/* Кнопки очистки данных - только для администраторов и разработчиков */}
            {(user.role === 'admin' || user.role === 'developer') && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearAllData}
                  className="flex items-center space-x-2 px-4 py-2 bg-mono-100 hover:bg-mono-200 border border-mono-300 text-black rounded-lg transition-colors duration-200"
                  title="Очистить данные справочников"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Очистить справочники</span>
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('🚨 ВНИМАНИЕ! Это удалит ВСЕ данные системы включая заказы, заявки и накладные. Продолжить?')) {
                      // Полная очистка всех данных системы
                      localStorage.clear()
                      console.log('ВСЕ данные системы очищены')
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-black hover:bg-mono-800 text-white rounded-lg transition-colors duration-200"
                  title="ПОЛНАЯ очистка всей системы"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>ОЧИСТИТЬ ВСЕ</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Предупреждение о ложных данных */}
        {availableDirectories.some(dir => dir.stats && dir.stats.total > 0) && (
          <div className="bg-mono-100 border border-mono-300 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-mono-600" />
              <h4 className="font-medium text-black">⚠️ Обнаружены ложные данные</h4>
            </div>
            <p className="text-sm text-mono-700 mb-3">
              В системе обнаружены тестовые данные, которые могут искажать статистику. 
              Рекомендуется очистить все данные для корректной работы системы.
            </p>
            {(user.role === 'admin' || user.role === 'developer') && (
              <button
                onClick={handleClearAllData}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-mono-100 hover:bg-mono-200 text-black rounded text-sm transition-colors duration-200"
              >
                <Trash2 className="h-3 w-3" />
                <span>Немедленно очистить</span>
              </button>
            )}
          </div>
        )}

        {/* Предупреждение о кэшировании браузера */}
        <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="h-5 w-5 text-black" />
            <h4 className="font-medium text-black">💡 Совет по обновлению данных</h4>
          </div>
          <p className="text-sm text-black mb-3">
            Если данные отображаются некорректно или показывают устаревшую информацию, 
            используйте кнопку "Обновить данные" для принудительной очистки кэша браузера.
          </p>
          <div className="text-xs text-black bg-mono-100 px-3 py-2 rounded">
            <strong>Альтернатива:</strong> Нажмите Ctrl+F5 для жесткого обновления страницы
          </div>
        </div>

        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Всего записей</p>
                <p className="text-2xl font-bold text-mono-900">
                  {availableDirectories.reduce((sum, dir) => sum + (dir.stats?.total || 0), 0)}
                </p>
              </div>
              <Database className="h-8 w-8 text-black" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Активных записей</p>
                <p className="text-2xl font-bold text-mono-900">
                  {availableDirectories.reduce((sum, dir) => sum + (dir.stats?.active || 0), 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-mono-100 rounded-full flex items-center justify-center">
                <span className="text-mono-600 font-bold">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Доступных справочников</p>
                <p className="text-2xl font-bold text-mono-900">{availableDirectories.length}</p>
              </div>
              <div className="h-8 w-8 bg-mono-100 rounded-full flex items-center justify-center">
                <span className="text-black font-bold">📁</span>
              </div>
            </div>
          </div>
        </div>

        {/* Сетка справочников */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDirectories.map((directory) => {
            const IconComponent = directory.icon
            
            return (
              <div
                key={directory.id}
                onClick={() => handleDirectoryClick(directory.path)}
                className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${directory.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${directory.color}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-mono-400 group-hover:text-primary-600 transition-colors duration-200" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-mono-900 group-hover:text-primary-700 transition-colors duration-200">
                    {directory.title}
                  </h3>
                  <p className="text-sm text-mono-600">
                    {directory.description}
                  </p>
                </div>

                {/* Статистика */}
                {directory.stats && (
                  <div className="mt-4 pt-4 border-t border-mono-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-mono-600">Записей:</span>
                      <div className="flex space-x-2">
                        <span className="font-medium text-mono-900">{directory.stats.total}</span>
                        <span className="text-mono-500">•</span>
                        <span className="text-mono-600 font-medium">{directory.stats.active} активных</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Информационный блок */}
        {user.role === 'manager' ? (
          <div className="bg-mono-100 border border-mono-300 rounded-lg p-6">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Ограничения доступа для менеджера
            </h4>
            <p className="text-sm text-mono-700">
              Как менеджер, вы имеете доступ только к справочнику контрагентов. 
              Для доступа к другим справочникам (марки бетона, склады, материалы, водители, транспорт) 
              обратитесь к администратору системы.
            </p>
          </div>
        ) : user.role === 'operator' ? (
          <div className="bg-mono-100 border border-mono-300 rounded-lg p-6">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Права доступа оператора
            </h4>
            <p className="text-sm text-mono-700">
              Как оператор, вы имеете доступ к справочникам материалов и марок бетона. 
              Также можете подавать внутренние заявки и использовать мессенджер. 
              Для доступа к другим справочникам обратитесь к администратору системы.
            </p>
          </div>
        ) : user.role === 'cook' ? (
          <div className="bg-mono-100 border border-mono-300 rounded-lg p-6">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <ChefHat className="h-4 w-4 mr-2" />
              Права доступа повара
            </h4>
            <p className="text-sm text-mono-700">
              Как повар, вы можете подавать внутренние заявки на продукты и инвентарь, 
              а также использовать мессенджер для общения. 
              Доступ к справочникам ограничен согласно вашей роли.
            </p>
          </div>
        ) : (
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-6">
            <h4 className="font-medium text-black mb-2">
              💡 О справочниках
            </h4>
            <p className="text-sm text-black">
              Справочники содержат базовую информацию, необходимую для работы системы. 
              Все данные организованы по категориям для удобного управления и поиска. 
              Регулярно обновляйте информацию в справочниках для корректной работы системы.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
