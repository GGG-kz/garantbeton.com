import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { UserActivityLog, BlockingLog, AuditLog, ReportFilters, ActivityStats } from '../../types/admin'
import { UserRole } from '../../types/auth'
import PageLayout from '../../components/PageLayout'
import ViewToggle from '../../components/ViewToggle'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  ShieldOff, 
  FileText,
  Calendar,
  Filter,
  Download,
  Eye,
  Clock,
  User,
  Activity,
  Database,
  AlertTriangle,
  Grid3X3,
  List
} from 'lucide-react'

// Моковые данные для тестирования
const mockActivityLogs: UserActivityLog[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Иван Петров',
    action: 'login',
    resource: 'auth',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    userId: '2',
    userName: 'Иван Петров',
    action: 'create',
    resource: 'counterparty',
    resourceId: '123',
    details: 'Создан новый контрагент "ООО Стройка"',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: '3',
    userId: '3',
    userName: 'Анна Сидорова',
    action: 'login',
    resource: 'auth',
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '4',
    userId: '3',
    userName: 'Анна Сидорова',
    action: 'update',
    resource: 'material',
    resourceId: '456',
    details: 'Обновлены данные материала "Цемент М400"',
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 10700000).toISOString(),
  },
  {
    id: '5',
    userId: '1',
    userName: 'Администратор Системы',
    action: 'block_user',
    resource: 'user',
    resourceId: '4',
    details: 'Заблокирован пользователь "Мария Кузнецова"',
    ipAddress: '192.168.1.1',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
]

const mockBlockingLogs: BlockingLog[] = [
  {
    id: '1',
    userId: '4',
    userName: 'Мария Кузнецова',
    action: 'block',
    reason: 'Нарушение политики безопасности',
    adminUserId: '1',
    adminUserName: 'Администратор Системы',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '2',
    userId: '5',
    userName: 'Сергей Волков',
    action: 'unblock',
    reason: 'Проблема решена',
    adminUserId: '1',
    adminUserName: 'Администратор Системы',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Иван Петров',
    action: 'create',
    resource: 'counterparty',
    resourceId: '123',
    resourceName: 'ООО Стройка',
    changes: {
      name: 'ООО Стройка',
      type: 'client',
      organizationType: 'legal',
      bin: '123456789012'
    },
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: '2',
    userId: '3',
    userName: 'Анна Сидорова',
    action: 'update',
    resource: 'material',
    resourceId: '456',
    resourceName: 'Цемент М400',
    changes: {
      name: 'Цемент М400',
      unit: 'кг',
      description: 'Портландцемент марки М400'
    },
    timestamp: new Date(Date.now() - 10700000).toISOString(),
  },
  {
    id: '3',
    userId: '2',
    userName: 'Иван Петров',
    action: 'delete',
    resource: 'concrete_grade',
    resourceId: '789',
    resourceName: 'Бетон М200',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
]

const actionLabels: Record<string, string> = {
  login: 'Вход в систему',
  logout: 'Выход из системы',
  create: 'Создание',
  update: 'Обновление',
  delete: 'Удаление',
  block_user: 'Блокировка пользователя',
  unblock_user: 'Разблокировка пользователя',
  create_user: 'Создание пользователя',
  delete_user: 'Удаление пользователя',
}

const resourceLabels: Record<string, string> = {
  auth: 'Аутентификация',
  user: 'Пользователь',
  counterparty: 'Контрагент',
  concrete_grade: 'Марка бетона',
  warehouse: 'Склад',
  material: 'Материал',
  driver: 'Водитель',
  vehicle: 'Транспорт',
}

export default function ReportsPage() {
  const { user } = useAuthStore()
  const [activityLogs, setActivityLogs] = useLocalStorage<UserActivityLog[]>('userActivityLogs', mockActivityLogs)
  const [blockingLogs, setBlockingLogs] = useLocalStorage<BlockingLog[]>('blockingLogs', mockBlockingLogs)
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('auditLogs', mockAuditLogs)
  const [viewMode, setViewMode] = useLocalStorage<'cards' | 'list'>('reportsViewMode', 'list')
  const [activeTab, setActiveTab] = useState<'activity' | 'blocking' | 'audit'>('activity')
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
  })

  // Проверяем права доступа
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-mono-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-mono-900 mb-4">Доступ запрещен</h1>
          <p className="text-mono-600">Только администраторы могут просматривать отчёты</p>
        </div>
      </div>
    )
  }

  // Фильтрация данных
  const filteredActivityLogs = activityLogs.filter(log => {
    const logDate = new Date(log.timestamp)
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
    const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null
    
    return (!fromDate || logDate >= fromDate) && 
           (!toDate || logDate <= toDate) &&
           (!filters.action || log.action === filters.action) &&
           (!filters.userId || log.userId === filters.userId)
  })

  const filteredBlockingLogs = blockingLogs.filter(log => {
    const logDate = new Date(log.timestamp)
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
    const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null
    
    return (!fromDate || logDate >= fromDate) && 
           (!toDate || logDate <= toDate)
  })

  const filteredAuditLogs = auditLogs.filter(log => {
    const logDate = new Date(log.timestamp)
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
    const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null
    
    return (!fromDate || logDate >= fromDate) && 
           (!toDate || logDate <= toDate) &&
           (!filters.resource || log.resource === filters.resource) &&
           (!filters.action || log.action === filters.action)
  })

  // Статистика
  const stats: ActivityStats = {
    totalUsers: 10,
    activeUsers: 8,
    blockedUsers: 2,
    totalLogins: filteredActivityLogs.filter(log => log.action === 'login').length,
    totalActions: filteredActivityLogs.length,
  }

  const handleExportData = () => {
    let dataToExport: any[] = []
    let filename = ''
    
    switch (activeTab) {
      case 'activity':
        dataToExport = filteredActivityLogs
        filename = 'activity_logs.csv'
        break
      case 'blocking':
        dataToExport = filteredBlockingLogs
        filename = 'blocking_logs.csv'
        break
      case 'audit':
        dataToExport = filteredAuditLogs
        filename = 'audit_logs.csv'
        break
    }
    
    // Простой экспорт в CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      dataToExport.map(row => Object.values(row).join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <PageLayout
      title="Отчёты системы"
      subtitle="Мониторинг активности пользователей и аудит действий"
    >
      <div className="space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-mono-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-mono-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Активных</p>
                <p className="text-2xl font-bold text-mono-600">{stats.activeUsers}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Заблокированных</p>
                <p className="text-2xl font-bold text-mono-600">{stats.blockedUsers}</p>
              </div>
              <ShieldOff className="h-8 w-8 text-mono-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Входов в систему</p>
                <p className="text-2xl font-bold text-black">{stats.totalLogins}</p>
              </div>
              <Activity className="h-8 w-8 text-mono-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-mono-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mono-600">Всего действий</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalActions}</p>
              </div>
              <Database className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Панель управления */}
        <div className="bg-white rounded-lg border border-mono-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Фильтры по дате */}
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">С</label>
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">По</label>
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Дополнительные фильтры */}
              {activeTab === 'activity' && (
                <select
                  value={filters.action || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                  className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                >
                  <option value="">Все действия</option>
                  {Object.entries(actionLabels).map(([action, label]) => (
                    <option key={action} value={action}>{label}</option>
                  ))}
                </select>
              )}

              {activeTab === 'audit' && (
                <>
                  <select
                    value={filters.resource || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value || undefined }))}
                    className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                  >
                    <option value="">Все ресурсы</option>
                    {Object.entries(resourceLabels).map(([resource, label]) => (
                      <option key={resource} value={resource}>{label}</option>
                    ))}
                  </select>
                  <select
                    value={filters.action || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                    className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                  >
                    <option value="">Все действия</option>
                    <option value="create">Создание</option>
                    <option value="update">Обновление</option>
                    <option value="delete">Удаление</option>
                  </select>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <button
                onClick={handleExportData}
                className="bg-mono-600 text-white px-4 py-2 rounded-lg hover:bg-mono-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Экспорт
              </button>
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="bg-white rounded-lg border border-mono-200">
          <div className="border-b border-mono-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-mono-500 text-black'
                    : 'border-transparent text-mono-500 hover:text-mono-700 hover:border-mono-300'
                }`}
              >
                <Activity className="h-4 w-4 inline mr-2" />
                Активность пользователей
              </button>
              <button
                onClick={() => setActiveTab('blocking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'blocking'
                    ? 'border-mono-500 text-black'
                    : 'border-transparent text-mono-500 hover:text-mono-700 hover:border-mono-300'
                }`}
              >
                <ShieldOff className="h-4 w-4 inline mr-2" />
                Блокировки
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-mono-500 text-black'
                    : 'border-transparent text-mono-500 hover:text-mono-700 hover:border-mono-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Аудит справочников
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Отображение активности */}
            {activeTab === 'activity' && (
              viewMode === 'list' ? (
                /* Табличный вид активности */
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-mono-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Действие
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Ресурс
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Детали
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        IP адрес
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Время
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-mono-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-mono-400 mr-2" />
                            <span className="text-sm font-medium text-mono-900">{log.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mono-100 text-black">
                            {actionLabels[log.action] || log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                          {resourceLabels[log.resource] || log.resource}
                        </td>
                        <td className="px-6 py-4 text-sm text-mono-900 max-w-xs truncate">
                          {log.details || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                          {log.ipAddress || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-mono-400 mr-1" />
                            {new Date(log.timestamp).toLocaleString('ru-RU')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              ) : (
                /* Карточный вид активности */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredActivityLogs.map((log) => (
                    <div key={log.id} className="bg-mono-50 rounded-lg border border-mono-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-mono-400 mr-2" />
                          <span className="font-medium text-mono-900">{log.userName}</span>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mono-100 text-black">
                          {actionLabels[log.action] || log.action}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-mono-600">
                          <Database className="h-4 w-4 text-mono-400 mr-2" />
                          {resourceLabels[log.resource] || log.resource}
                        </div>
                        {log.details && (
                          <div className="text-mono-700 bg-white rounded p-2 border">
                            {log.details}
                          </div>
                        )}
                        {log.ipAddress && (
                          <div className="text-mono-500">
                            IP: {log.ipAddress}
                          </div>
                        )}
                        <div className="flex items-center text-mono-500">
                          <Clock className="h-4 w-4 text-mono-400 mr-1" />
                          {new Date(log.timestamp).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Отображение блокировок */}
            {activeTab === 'blocking' && (
              viewMode === 'list' ? (
                /* Табличный вид блокировок */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-mono-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Действие
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Причина
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Администратор
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Время
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBlockingLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-mono-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-mono-400 mr-2" />
                            <span className="text-sm font-medium text-mono-900">{log.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.action === 'block' 
                              ? 'bg-red-100 text-mono-800' 
                              : 'bg-mono-100 text-mono-800'
                          }`}>
                            {log.action === 'block' ? (
                              <>
                                <ShieldOff className="h-3 w-3 mr-1" />
                                Блокировка
                              </>
                            ) : (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Разблокировка
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-mono-900">
                          {log.reason || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                          {log.adminUserName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-mono-400 mr-1" />
                            {new Date(log.timestamp).toLocaleString('ru-RU')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              ) : (
                /* Карточный вид блокировок */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBlockingLogs.map((log) => (
                    <div key={log.id} className="bg-mono-50 rounded-lg border border-mono-200 p-4 relative">
                      {/* Действие в правом верхнем углу */}
                      <div className="absolute top-4 right-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          log.action === 'block' 
                            ? 'bg-red-100 text-mono-800' 
                            : 'bg-mono-100 text-mono-800'
                        }`}>
                          {log.action === 'block' ? (
                            <>
                              <ShieldOff className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span>Блокировка</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span>Разблокировка</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Основная информация */}
                      <div className="mb-3 pr-20">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-mono-400 mr-2 flex-shrink-0" />
                          <span className="font-medium text-mono-900 truncate">{log.userName}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        {log.reason && (
                          <div className="text-mono-700 bg-white rounded p-2 border">
                            <strong>Причина:</strong> {log.reason}
                          </div>
                        )}
                        <div className="text-mono-600">
                          <strong>Администратор:</strong> {log.adminUserName}
                        </div>
                        <div className="flex items-center text-mono-500">
                          <Clock className="h-4 w-4 text-mono-400 mr-1" />
                          {new Date(log.timestamp).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Отображение аудита */}
            {activeTab === 'audit' && (
              viewMode === 'list' ? (
                /* Табличный вид аудита */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-mono-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Действие
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Ресурс
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Название
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Время
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-mono-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-mono-400 mr-2" />
                            <span className="text-sm font-medium text-mono-900">{log.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.action === 'create' 
                              ? 'bg-mono-100 text-mono-800'
                              : log.action === 'update'
                              ? 'bg-mono-100 text-black'
                              : 'bg-red-100 text-mono-800'
                          }`}>
                            {log.action === 'create' && 'Создание'}
                            {log.action === 'update' && 'Обновление'}
                            {log.action === 'delete' && 'Удаление'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                          {resourceLabels[log.resource] || log.resource}
                        </td>
                        <td className="px-6 py-4 text-sm text-mono-900">
                          {log.resourceName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-mono-400 mr-1" />
                            {new Date(log.timestamp).toLocaleString('ru-RU')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              ) : (
                /* Карточный вид аудита */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAuditLogs.map((log) => (
                    <div key={log.id} className="bg-mono-50 rounded-lg border border-mono-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-mono-400 mr-2" />
                          <span className="font-medium text-mono-900">{log.userName}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.action === 'create' 
                            ? 'bg-mono-100 text-mono-800'
                            : log.action === 'update'
                            ? 'bg-mono-100 text-black'
                            : 'bg-red-100 text-mono-800'
                        }`}>
                          {log.action === 'create' && 'Создание'}
                          {log.action === 'update' && 'Обновление'}
                          {log.action === 'delete' && 'Удаление'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-mono-600">
                          <Database className="h-4 w-4 text-mono-400 mr-2" />
                          {resourceLabels[log.resource] || log.resource}
                        </div>
                        <div className="text-mono-700 bg-white rounded p-2 border">
                          <strong>Объект:</strong> {log.resourceName}
                        </div>
                        <div className="flex items-center text-mono-500">
                          <Clock className="h-4 w-4 text-mono-400 mr-1" />
                          {new Date(log.timestamp).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Пустое состояние */}
            {((activeTab === 'activity' && filteredActivityLogs.length === 0) ||
              (activeTab === 'blocking' && filteredBlockingLogs.length === 0) ||
              (activeTab === 'audit' && filteredAuditLogs.length === 0)) && (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-mono-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-mono-900 mb-2">Нет данных</h3>
                <p className="text-mono-500">За выбранный период не найдено записей</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
