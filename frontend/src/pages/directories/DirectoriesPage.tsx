import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import PageLayout from '../../components/PageLayout'
import { useApiStats } from '../../hooks/useApiStats'
import { clearAllDirectoryData, checkLocalStorageData, clearEntireSystem } from '../../utils/clearAllData'
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
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    allowedRoles: ['developer', 'admin', 'manager', 'dispatcher', 'supply', 'accountant', 'director'],
    storageKey: 'counterparties'
  },
  {
    id: 'concrete-grades',
    title: 'Марки бетона',
    description: 'Номенклатура бетонных смесей',
    icon: Layers,
    path: '/directories/concrete-grades',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'supply', 'accountant', 'director', 'operator'],
    storageKey: 'concreteGrades'
  },
  {
    id: 'warehouses',
    title: 'Склады',
    description: 'Складские помещения и запасы',
    icon: Warehouse,
    path: '/directories/warehouses',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'supply', 'accountant', 'director'],
    storageKey: 'warehouses'
  },
  {
    id: 'materials',
    title: 'Материалы',
    description: 'Сырье и компоненты',
    icon: Package,
    path: '/directories/materials',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'supply', 'accountant', 'director', 'operator'],
    storageKey: 'materials'
  },
  {
    id: 'drivers',
    title: 'Водители',
    description: 'Персонал водителей',
    icon: Users,
    path: '/directories/drivers',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'accountant', 'director'],
    storageKey: 'drivers'
  },
  {
    id: 'vehicles',
    title: 'Транспорт',
    description: 'Автобетоносмесители и самосвалы',
    icon: Truck,
    path: '/directories/vehicles',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    allowedRoles: ['developer', 'admin', 'dispatcher', 'accountant', 'director'],
    storageKey: 'vehicles'
  }
]

export default function DirectoriesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { stats, loading, error, refresh } = useApiStats()

  // Маппинг storageKey на stats из API
  const getStatsFromApi = (storageKey: string) => {
    console.log(`🔍 DirectoriesPage: Получаем статистику для ${storageKey}`)
    console.log('📊 DirectoriesPage: Текущие stats:', stats)
    console.log('🔄 DirectoriesPage: Loading state:', loading)
    
    // Если данные еще загружаются, возвращаем пустую статистику
    if (loading || !stats) {
      console.log('⏳ DirectoriesPage: Данные еще загружаются, возвращаем {total: 0, active: 0}')
      return { total: 0, active: 0 }
    }
    
    switch (storageKey) {
      case 'counterparties':
        console.log('✅ DirectoriesPage: Возвращаем counterparties:', stats.counterparties)
        return stats.counterparties || { total: 0, active: 0 }
      case 'concreteGrades':
        console.log('✅ DirectoriesPage: Возвращаем concreteGrades:', stats.concreteGrades)
        return stats.concreteGrades || { total: 0, active: 0 }
      case 'warehouses':
        console.log('✅ DirectoriesPage: Возвращаем warehouses:', stats.warehouses)
        return stats.warehouses || { total: 0, active: 0 }
      case 'materials':
        console.log('✅ DirectoriesPage: Возвращаем materials:', stats.materials)
        return stats.materials || { total: 0, active: 0 }
      case 'drivers':
        console.log('✅ DirectoriesPage: Возвращаем drivers:', stats.drivers)
        return stats.drivers || { total: 0, active: 0 }
      case 'vehicles':
        console.log('✅ DirectoriesPage: Возвращаем vehicles:', stats.vehicles)
        return stats.vehicles || { total: 0, active: 0 }
      default:
        console.log('⚠️ DirectoriesPage: Неизвестный storageKey:', storageKey)
        return { total: 0, active: 0 }
    }
  }

  // Фильтруем справочники по роли пользователя и добавляем динамическую статистику
  const availableDirectories = directories
    .filter(directory => !user || directory.allowedRoles.includes(user.role))
    .map(directory => ({
      ...directory,
      stats: getStatsFromApi(directory.storageKey)
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
      clearAllDirectoryData()
      checkLocalStorageData()
      
      // Принудительно обновляем страницу для применения изменений
      window.location.reload()
    }
  }

  // Если пользователь не авторизован, показываем сообщение
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">Необходимо войти в систему</p>
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
              <h2 className="text-2xl font-bold text-gray-900">Справочники</h2>
              <p className="text-gray-600">Базовая информация для работы системы</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Кнопка обновления статистики */}
            <button
              onClick={() => {
                console.log('🔄 DirectoriesPage: Принудительно обновляем статистику...')
                refresh()
              }}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
              title="Обновить статистику справочников"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Загрузка...' : 'Обновить статистику'}</span>
            </button>

            {/* Кнопка обновления данных */}
            <button
              onClick={() => {
                window.location.reload()
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
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
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg transition-colors duration-200"
                  title="Очистить данные справочников"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Очистить справочники</span>
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('🚨 ВНИМАНИЕ! Это удалит ВСЕ данные системы включая заказы, заявки и накладные. Продолжить?')) {
                      clearEntireSystem()
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  title="ПОЛНАЯ очистка всей системы"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>ОЧИСТИТЬ ВСЕ</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ошибка загрузки статистики */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-900">❌ Ошибка загрузки статистики</h4>
            </div>
            <p className="text-sm text-red-700 mb-3">
              {error}
            </p>
            <button
              onClick={() => {
                console.log('🔄 DirectoriesPage: Повторная попытка загрузки статистики...')
                refresh()
              }}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm transition-colors duration-200"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Повторить попытку</span>
            </button>
          </div>
        )}

        {/* Предупреждение о ложных данных */}
        {availableDirectories.some(dir => dir.stats && dir.stats.total > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">⚠️ Обнаружены ложные данные</h4>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              В системе обнаружены тестовые данные, которые могут искажать статистику. 
              Рекомендуется очистить все данные для корректной работы системы.
            </p>
            {(user.role === 'admin' || user.role === 'developer') && (
              <button
                onClick={handleClearAllData}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm transition-colors duration-200"
              >
                <Trash2 className="h-3 w-3" />
                <span>Немедленно очистить</span>
              </button>
            )}
          </div>
        )}

        {/* Предупреждение о кэшировании браузера */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">💡 Совет по обновлению данных</h4>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Если данные отображаются некорректно или показывают устаревшую информацию, 
            используйте кнопку "Обновить данные" для принудительной очистки кэша браузера.
          </p>
          <div className="text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded">
            <strong>Альтернатива:</strong> Нажмите Ctrl+F5 для жесткого обновления страницы
          </div>
        </div>

        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего записей</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableDirectories.reduce((sum, dir) => sum + (dir.stats?.total || 0), 0)}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активных записей</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableDirectories.reduce((sum, dir) => sum + (dir.stats?.active || 0), 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Доступных справочников</p>
                <p className="text-2xl font-bold text-gray-900">{availableDirectories.length}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">📁</span>
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
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${directory.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${directory.color}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
                    {directory.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {directory.description}
                  </p>
                </div>

                {/* Статистика */}
                {directory.stats && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Записей:</span>
                      <div className="flex space-x-2">
                        <span className="font-medium text-gray-900">{directory.stats.total}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-green-600 font-medium">{directory.stats.active} активных</span>
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Ограничения доступа для менеджера
            </h4>
            <p className="text-sm text-yellow-700">
              Как менеджер, вы имеете доступ только к справочнику контрагентов. 
              Для доступа к другим справочникам (марки бетона, склады, материалы, водители, транспорт) 
              обратитесь к администратору системы.
            </p>
          </div>
        ) : user.role === 'operator' ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h4 className="font-medium text-indigo-900 mb-2 flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Права доступа оператора
            </h4>
            <p className="text-sm text-indigo-700">
              Как оператор, вы имеете доступ к справочникам материалов и марок бетона. 
              Также можете подавать внутренние заявки и использовать мессенджер. 
              Для доступа к другим справочникам обратитесь к администратору системы.
            </p>
          </div>
        ) : user.role === 'cook' ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h4 className="font-medium text-orange-900 mb-2 flex items-center">
              <ChefHat className="h-4 w-4 mr-2" />
              Права доступа повара
            </h4>
            <p className="text-sm text-orange-700">
              Как повар, вы можете подавать внутренние заявки на продукты и инвентарь, 
              а также использовать мессенджер для общения. 
              Доступ к справочникам ограничен согласно вашей роли.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 О справочниках
            </h4>
            <p className="text-sm text-blue-700">
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
