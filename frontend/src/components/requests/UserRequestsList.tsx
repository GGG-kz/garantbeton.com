import { useState } from 'react'
import { 
  InternalRequest, 
  REQUEST_CATEGORIES, 
  REQUEST_STATUSES, 
  REQUEST_PRIORITIES,
  STATUS_COLORS,
  PRIORITY_COLORS 
} from '../../types/requests'
import { 
  FileText, 
  Calendar, 
  User, 
  Package, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Hand
} from 'lucide-react'

interface UserRequestsListProps {
  requests: InternalRequest[]
  viewMode: 'cards' | 'list'
  onRefresh: () => void
  onMarkAsReceived?: (requestId: string) => void
}

export default function UserRequestsList({ requests, viewMode, onRefresh, onMarkAsReceived }: UserRequestsListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Фильтрация заявок
  const filteredRequests = requests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.status === filterStatus
    const categoryMatch = filterCategory === 'all' || request.category === filterCategory
    return statusMatch && categoryMatch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'priced':
        return <Package className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'paid':
        return <DollarSign className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'received':
        return <Hand className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-mono-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Статус
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Все статусы</option>
              {Object.entries(REQUEST_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Категория
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Все категории</option>
              {Object.entries(REQUEST_CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Отображение заявок */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-mono-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mono-900 mb-2">Заявок не найдено</h3>
          <p className="text-mono-500">
            {requests.length === 0 
              ? 'У вас пока нет заявок' 
              : 'Попробуйте изменить фильтры'
            }
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* Табличный вид */
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-mono-900 mb-2">
                    {request.title}
                  </h3>
                  <p className="text-sm text-mono-600 mb-3">
                    {request.description}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1">{REQUEST_STATUSES[request.status]}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-mono-600">
                  <Package className="h-4 w-4 text-mono-400 mr-2" />
                  <span>{REQUEST_CATEGORIES[request.category]}</span>
                </div>

                <div className="flex items-center text-mono-600">
                  <AlertCircle className="h-4 w-4 text-mono-400 mr-2" />
                  <span className={PRIORITY_COLORS[request.priority]}>
                    {REQUEST_PRIORITIES[request.priority]}
                  </span>
                </div>

                <div className="flex items-center text-mono-600">
                  <Calendar className="h-4 w-4 text-mono-400 mr-2" />
                  <span>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>

              {request.counterpartyName && (
                <div className="mt-3 p-3 bg-mono-50 rounded-lg">
                  <div className="flex items-center text-sm text-mono-700 mb-1">
                    <User className="h-4 w-4 text-mono-400 mr-2" />
                    <strong>Контрагент:</strong>
                  </div>
                  <p className="text-sm text-mono-700 ml-6">
                    {request.counterpartyName}
                  </p>
                </div>
              )}

              {request.price && (
                <div className="mt-3 p-3 bg-mono-50 rounded-lg">
                  <div className="flex items-center text-sm text-mono-700 mb-1">
                    <DollarSign className="h-4 w-4 text-green-400 mr-2" />
                    <strong>Цена:</strong>
                  </div>
                  <p className="text-lg font-semibold text-mono-800 ml-6">
                    {request.price.toLocaleString('ru-RU')} ₸
                  </p>
                </div>
              )}

              {request.notes && (
                <div className="mt-3 p-3 bg-mono-50 rounded-lg">
                  <p className="text-sm text-mono-700">
                    <strong>Примечания:</strong> {request.notes}
                  </p>
                </div>
              )}

              {/* Кнопка "Отметить получение" для выполненных заявок */}
              {request.status === 'completed' && onMarkAsReceived && (
                <div className="mt-4 pt-4 border-t border-mono-200">
                  <button
                    onClick={() => onMarkAsReceived(request.id)}
                    className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Hand className="h-4 w-4 mr-2" />
                    Отметить получение
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Карточный вид */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200 relative"
            >
              {/* Статус в правом верхнем углу */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[request.status]}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1">{REQUEST_STATUSES[request.status]}</span>
                </span>
              </div>

              {/* Основная информация */}
              <div className="mb-4 pr-20">
                <h3 className="text-lg font-semibold text-mono-900 mb-2 truncate">
                  {request.title}
                </h3>
                <p className="text-sm text-mono-600 line-clamp-2">
                  {request.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-mono-600">
                  <Package className="h-4 w-4 text-mono-400 mr-2" />
                  <span>{REQUEST_CATEGORIES[request.category]}</span>
                </div>

                <div className="flex items-center text-sm text-mono-600">
                  <AlertCircle className="h-4 w-4 text-mono-400 mr-2" />
                  <span className={PRIORITY_COLORS[request.priority]}>
                    {REQUEST_PRIORITIES[request.priority]}
                  </span>
                </div>

                <div className="flex items-center text-sm text-mono-600">
                  <Calendar className="h-4 w-4 text-mono-400 mr-2" />
                  <span>Создано: {new Date(request.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>

                {request.counterpartyName && (
                  <div className="flex items-center text-sm text-mono-600">
                    <User className="h-4 w-4 text-mono-400 mr-2" />
                    <span>Контрагент: {request.counterpartyName}</span>
                  </div>
                )}

                {request.price && (
                  <div className="flex items-center text-sm text-mono-600">
                    <DollarSign className="h-4 w-4 text-mono-400 mr-2" />
                    <span>Цена: {request.price.toLocaleString('ru-RU')} ₸</span>
                  </div>
                )}
              </div>

              {/* Кнопка "Отметить получение" для выполненных заявок */}
              {request.status === 'completed' && onMarkAsReceived && (
                <div className="mt-4 pt-4 border-t border-mono-200">
                  <button
                    onClick={() => onMarkAsReceived(request.id)}
                    className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Hand className="h-4 w-4 mr-2" />
                    Отметить получение
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Статистика */}
      {requests.length > 0 && (
        <div className="bg-mono-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-mono-700 mb-2">Статистика ваших заявок</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-mono-900">{requests.length}</div>
              <div className="text-mono-600">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-mono-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-mono-600">На рассмотрении</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">
                {requests.filter(r => r.status === 'priced').length}
              </div>
              <div className="text-mono-600">Оценено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-mono-600">
                {requests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-mono-600">Одобрено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {requests.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-mono-600">Выполнено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {requests.filter(r => r.status === 'received').length}
              </div>
              <div className="text-mono-600">Получено</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
