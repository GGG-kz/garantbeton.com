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
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  Package,
  Eye,
  Filter,
  DollarSign
} from 'lucide-react'
import SetPriceModal from './SetPriceModal'
import SetSupplierDetailsModal from './SetSupplierDetailsModal'

interface AdminRequestsTableProps {
  requests: InternalRequest[]
  viewMode: 'cards' | 'list'
  onUpdateRequest: (id: string, updates: Partial<InternalRequest>) => void
  onRefresh: () => void
  userRole: string
}

export default function AdminRequestsTable({ requests, viewMode, onUpdateRequest, onRefresh, userRole }: AdminRequestsTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<InternalRequest | null>(null)
  const [priceModalOpen, setPriceModalOpen] = useState(false)
  const [requestForPrice, setRequestForPrice] = useState<InternalRequest | null>(null)
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const [requestForSupplier, setRequestForSupplier] = useState<InternalRequest | null>(null)

  // Определяем доступные действия в зависимости от роли
  const canSetSupplierDetails = userRole === 'supply'
  const canApprove = userRole === 'director'
  const canPay = userRole === 'accountant'
  const canComplete = userRole === 'supply'

  // Фильтрация заявок
  const filteredRequests = requests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.status === filterStatus
    const categoryMatch = filterCategory === 'all' || request.category === filterCategory
    const priorityMatch = filterPriority === 'all' || request.priority === filterPriority
    const searchMatch = searchTerm === '' || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return statusMatch && categoryMatch && priorityMatch && searchMatch
  })

  const handleStatusChange = (requestId: string, newStatus: string) => {
    const updates: Partial<InternalRequest> = {
      status: newStatus as any,
      updatedAt: new Date().toISOString()
    }

    if (newStatus === 'approved' || newStatus === 'completed') {
      updates.approvedBy = 'Текущий пользователь' // В реальном приложении брать из auth
      updates.approvedAt = new Date().toISOString()
    }

    if (newStatus === 'completed') {
      updates.completedBy = 'Текущий пользователь'
      updates.completedAt = new Date().toISOString()
    }

    onUpdateRequest(requestId, updates)
  }

  const handleUpdateStatus = (requestId: string, newStatus: string) => {
    handleStatusChange(requestId, newStatus)
  }

  const handleSetPrice = (requestId: string, price: number, notes?: string) => {
    const updates: Partial<InternalRequest> = {
      status: 'approved',
      updatedAt: new Date().toISOString(),
      approvedBy: 'Бухгалтер',
      approvedAt: new Date().toISOString(),
      notes: notes ? `${notes} | Цена: ${price.toLocaleString('ru-RU')} ₸` : `Цена: ${price.toLocaleString('ru-RU')} ₸`
    }

    onUpdateRequest(requestId, updates)
  }

  const openPriceModal = (request: InternalRequest) => {
    setRequestForPrice(request)
    setPriceModalOpen(true)
  }

  const handleSetSupplierDetails = (requestId: string, counterpartyId: string, counterpartyName: string, price: number, notes?: string) => {
    const updates: Partial<InternalRequest> = {
      status: 'priced',
      counterpartyId,
      counterpartyName,
      price,
      currency: 'KZT',
      updatedAt: new Date().toISOString(),
      notes: notes ? `${notes} | Поставщик: ${counterpartyName} | Цена: ${price.toLocaleString('ru-RU')} ₸` : `Поставщик: ${counterpartyName} | Цена: ${price.toLocaleString('ru-RU')} ₸`
    }

    onUpdateRequest(requestId, updates)
  }

  const handlePay = (requestId: string) => {
    const updates: Partial<InternalRequest> = {
      status: 'paid',
      updatedAt: new Date().toISOString(),
      paidBy: 'Бухгалтер',
      paidAt: new Date().toISOString()
    }

    onUpdateRequest(requestId, updates)
  }

  const openSupplierModal = (request: InternalRequest) => {
    setRequestForSupplier(request)
    setSupplierModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg border border-mono-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              <Filter className="inline-block h-4 w-4 mr-1" />
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

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Приоритет
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Все приоритеты</option>
              {Object.entries(REQUEST_PRIORITIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Поиск
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Поиск по названию, описанию или заявителю..."
            />
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center p-3 bg-mono-50 rounded-lg">
            <div className="text-2xl font-bold text-mono-900">{filteredRequests.length}</div>
            <div className="text-mono-600">Найдено</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-mono-600">
              {filteredRequests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-mono-600">На рассмотрении</div>
          </div>
          <div className="text-center p-3 bg-mono-50 rounded-lg">
            <div className="text-2xl font-bold text-black">
              {filteredRequests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-mono-600">Одобрено</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {filteredRequests.filter(r => r.status === 'paid').length}
            </div>
            <div className="text-mono-600">Оплачено</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-mono-600">
              {filteredRequests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-mono-600">Выполнено</div>
          </div>
        </div>
      </div>

      {/* Отображение заявок */}
      {viewMode === 'list' ? (
        /* Табличный вид */
        <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-mono-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Заявка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Заявитель
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Приоритет
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-mono-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Package className="h-10 w-10 text-mono-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-mono-900 max-w-xs truncate">
                          {request.title}
                        </div>
                        <div className="text-sm text-mono-500 max-w-xs truncate">
                          {request.description}
                        </div>
                        {request.quantity && (
                          <div className="text-xs text-mono-400">
                            {request.quantity} {request.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-mono-400 mr-2" />
                      <div className="text-sm text-mono-900">{request.userName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-mono-900">
                      {REQUEST_CATEGORIES[request.category]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{REQUEST_STATUSES[request.status]}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[request.priority]}`}>
                      {REQUEST_PRIORITIES[request.priority]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-mono-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(request.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Просмотр деталей"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {/* Снабженец может указывать поставщика и цену */}
                      {canSetSupplierDetails && request.status === 'pending' && (
                        <button
                          onClick={() => openSupplierModal(request)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Указать поставщика и цену"
                        >
                          <Package className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Директор может одобрять/отклонять после указания цены */}
                      {canApprove && request.status === 'priced' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(request.id, 'approved')}
                            className="text-mono-600 hover:text-green-900"
                            title="Одобрить заявку"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(request.id, 'rejected')}
                            className="text-mono-600 hover:text-red-900"
                            title="Отклонить заявку"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {/* Бухгалтер может оплачивать */}
                      {canPay && request.status === 'approved' && (
                        <button
                          onClick={() => handlePay(request.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Оплатить заказ"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Снабженец может выполнять после оплаты */}
                      {canComplete && request.status === 'paid' && (
                        <button
                          onClick={() => handleStatusChange(request.id, 'completed')}
                          className="text-mono-600 hover:text-green-900"
                          title="Отметить как выполненное"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-mono-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-900 mb-2">Заявок не найдено</h3>
            <p className="text-mono-500">
              {requests.length === 0 
                ? 'Пока нет заявок' 
                : 'Попробуйте изменить фильтры или поисковый запрос'
              }
            </p>
          </div>
        )}
      </div>
      ) : (
        /* Карточный вид */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200 relative">
              {/* Статус в правом верхнем углу */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[request.status]}`}>
                  {REQUEST_STATUSES[request.status]}
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
                  <User className="h-4 w-4 text-mono-400 mr-2" />
                  <span>{request.userName}</span>
                </div>

                <div className="flex items-center text-sm text-mono-600">
                  <Package className="h-4 w-4 text-mono-400 mr-2" />
                  <span>{REQUEST_CATEGORIES[request.category]}</span>
                </div>

                <div className="flex items-center text-sm text-mono-600">
                  <Calendar className="h-4 w-4 text-mono-400 mr-2" />
                  <span>Создано: {new Date(request.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>

                <div className="flex items-center text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[request.priority]}`}>
                    {REQUEST_PRIORITIES[request.priority]}
                  </span>
                </div>

                {request.counterpartyName && (
                  <div className="flex items-center text-sm text-mono-600">
                    <DollarSign className="h-4 w-4 text-mono-400 mr-2" />
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

              {/* Действия для карточки */}
              <div className="mt-4 pt-4 border-t border-mono-200 flex gap-2">
                {userRole === 'supply' && request.status === 'pending' && (
                  <button
                    onClick={() => setRequestForSupplier(request)}
                    className="flex-1 bg-black text-white px-3 py-2 rounded text-sm hover:bg-black transition-colors duration-200"
                  >
                    Указать поставщика
                  </button>
                )}
                
                {userRole === 'director' && request.status === 'priced' && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'approved')}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                  >
                    Одобрить
                  </button>
                )}
                
                {userRole === 'accountant' && request.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'paid')}
                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors duration-200"
                  >
                    Оплатить
                  </button>
                )}
                
                {(userRole === 'supply' || userRole === 'director') && request.status === 'paid' && (
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'completed')}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                  >
                    Выполнить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно с деталями заявки */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-mono-200">
              <h3 className="text-lg font-semibold text-mono-900">Детали заявки</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-mono-400 hover:text-mono-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-mono-900 mb-2">{selectedRequest.title}</h4>
                <p className="text-mono-700">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-mono-700">Заявитель:</span>
                  <span className="ml-2 text-mono-900">{selectedRequest.userName}</span>
                </div>
                <div>
                  <span className="font-medium text-mono-700">Категория:</span>
                  <span className="ml-2 text-mono-900">{REQUEST_CATEGORIES[selectedRequest.category]}</span>
                </div>
                <div>
                  <span className="font-medium text-mono-700">Статус:</span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedRequest.status]}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="ml-1">{REQUEST_STATUSES[selectedRequest.status]}</span>
                  </span>
                </div>
                <div>
                  <span className="font-medium text-mono-700">Приоритет:</span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[selectedRequest.priority]}`}>
                    {REQUEST_PRIORITIES[selectedRequest.priority]}
                  </span>
                </div>
                {selectedRequest.quantity && (
                  <div>
                    <span className="font-medium text-mono-700">Количество:</span>
                    <span className="ml-2 text-mono-900">{selectedRequest.quantity} {selectedRequest.unit}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-mono-700">Дата создания:</span>
                  <span className="ml-2 text-mono-900">{formatDate(selectedRequest.createdAt)}</span>
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <span className="font-medium text-mono-700">Примечания:</span>
                  <p className="mt-1 text-mono-900">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.approvedBy && (
                <div className="bg-mono-50 p-3 rounded-lg">
                  <span className="font-medium text-black">Одобрено:</span>
                  <p className="text-black">{selectedRequest.approvedBy} - {formatDate(selectedRequest.approvedAt!)}</p>
                </div>
              )}

              {selectedRequest.completedBy && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <span className="font-medium text-green-900">Выполнено:</span>
                  <p className="text-mono-700">{selectedRequest.completedBy} - {formatDate(selectedRequest.completedAt!)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для установки цены */}
      <SetPriceModal
        isOpen={priceModalOpen}
        onClose={() => {
          setPriceModalOpen(false)
          setRequestForPrice(null)
        }}
        onSetPrice={handleSetPrice}
        request={requestForPrice}
      />

      {/* Модальное окно для указания поставщика и цены */}
      <SetSupplierDetailsModal
        isOpen={supplierModalOpen}
        onClose={() => {
          setSupplierModalOpen(false)
          setRequestForSupplier(null)
        }}
        onSetDetails={handleSetSupplierDetails}
        request={requestForSupplier}
      />
    </div>
  )
}
