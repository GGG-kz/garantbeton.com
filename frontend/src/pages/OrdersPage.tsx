import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import OrderModal from '../components/orders/OrderModal'
import ViewToggle from '../components/ViewToggle'
import { ConcreteOrder, CreateOrderRequest, UpdateOrderRequest, AdditionalService, ORDER_STATUSES, ORDER_PRIORITIES, ORDER_STATUS_COLORS, ORDER_PRIORITY_COLORS, EMPTY_ADDITIONAL_SERVICES } from '../types/orders'
import { Counterparty, ConcreteGrade, Warehouse } from '../types/directories'
import { useAuthStore } from '../stores/authStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { 
  Plus, 
  Search, 
  Package, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  User
} from 'lucide-react'

const mockOrders: ConcreteOrder[] = []
const mockCounterparties: Counterparty[] = []

const mockConcreteGrades: ConcreteGrade[] = []
const mockWarehouses: Warehouse[] = []

export default function OrdersPage() {
  const { user } = useAuthStore()
  
  // Проверяем права доступа - доступно всем ролям
  const canAccessOrders = true
  
  if (!canAccessOrders) {
    return (
      <PageLayout title="Заказы бетона">
        <div className="p-8 text-center">
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-mono-600 text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-mono-800 mb-2">Доступ запрещён</h2>
            <p className="text-mono-600">
              У вас нет прав для просмотра заказов бетона. Доступ разрешён только для менеджеров, директоров, диспетчеров и бухгалтеров.
            </p>
          </div>
        </div>
      </PageLayout>
    )
  }
  
  const [orders, setOrders] = useLocalStorage<ConcreteOrder[]>('orders', mockOrders)
  const [viewMode, setViewMode] = useLocalStorage<'cards' | 'list'>('ordersViewMode', 'list')
  
  // Инициализируем данные контрагентов, марок бетона, складов и услуг, если они пустые
  const [counterparties, setCounterparties] = useLocalStorage<Counterparty[]>('counterparties', mockCounterparties)
  const [concreteGrades, setConcreteGrades] = useLocalStorage<ConcreteGrade[]>('concreteGrades', mockConcreteGrades)
  const [warehouses] = useLocalStorage<Warehouse[]>('warehouses', mockWarehouses)
  const [additionalServices] = useLocalStorage<AdditionalService[]>('additionalServices', EMPTY_ADDITIONAL_SERVICES)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ConcreteOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<ConcreteOrder | null>(null)

  // Определяем, может ли пользователь видеть цены
  const canViewPrice = user?.role === 'director' || user?.role === 'accountant' || user?.role === 'manager'

  const filteredOrders = orders.filter(order => {
    // Менеджеры видят только свои заявки, остальные роли видят все заявки
    const isManagerRestricted = user?.role === 'manager' && order.createdBy !== user?.id
    if (isManagerRestricted) return false
    
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deliveryObject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.concreteGradeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority && order.isActive
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'in_production':
        return <Package className="h-4 w-4" />
      case 'ready':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleAdd = () => {
    setEditingOrder(null)
    setIsModalOpen(true)
  }

  const handleEdit = (order: ConcreteOrder) => {
    // Проверяем права на редактирование - только директор и бухгалтер
    const canEdit = user?.role === 'director' || user?.role === 'accountant'
    
    if (!canEdit) {
      alert('У вас нет прав для редактирования заказов. Редактировать могут только директор и бухгалтер.')
      return
    }
    
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const handleView = (order: ConcreteOrder) => {
    setViewingOrder(order)
  }

  const handleDelete = (id: string) => {
    // Находим заказ для проверки прав
    const order = orders.find(o => o.id === id)
    if (!order) return
    
    // Проверяем права на удаление - только директор и бухгалтер
    const canDelete = user?.role === 'director' || user?.role === 'accountant'
    
    if (!canDelete) {
      alert('У вас нет прав для удаления заказов. Удалять могут только директор и бухгалтер.')
      return
    }
    
    if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, isActive: false } : order
      ))
    }
  }

  const handleApprove = (order: ConcreteOrder) => {
    if (window.confirm('Подтвердить заявку и перевести в статус "Подтверждён"?')) {
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, status: 'confirmed', updatedAt: new Date().toISOString() } : o
      ))
    }
  }

  const handleSetPriority = (order: ConcreteOrder) => {
    const newPriority = prompt(
      `Установить приоритет для заказа #${order.id}:\n\n1 - Низкий\n2 - Средний\n3 - Высокий\n4 - Срочный\n\nВведите номер (1-4):`
    )
    
    if (newPriority) {
      const priorityMap = {
        '1': 'low',
        '2': 'medium', 
        '3': 'high',
        '4': 'urgent'
      }
      
      const priority = priorityMap[newPriority as keyof typeof priorityMap] as 'low' | 'medium' | 'high' | 'urgent'
      if (priority) {
        setOrders(prev => prev.map(o => 
          o.id === order.id ? { ...o, priority, updatedAt: new Date().toISOString() } : o
        ))
      } else {
        alert('Неверный номер приоритета. Введите число от 1 до 4.')
      }
    }
  }

  const handleSave = (data: CreateOrderRequest | UpdateOrderRequest) => {
    if (editingOrder) {
      // Проверяем права на редактирование существующего заказа - только директор и бухгалтер
      const canEdit = user?.role === 'director' || user?.role === 'accountant'
      
      if (!canEdit) {
        alert('У вас нет прав для редактирования заказов. Редактировать могут только директор и бухгалтер.')
        return
      }
      
      // Редактирование существующего заказа
      setOrders(prev => prev.map(order => 
        order.id === editingOrder.id 
          ? { 
              ...order, 
              ...data, 
              updatedAt: new Date().toISOString(),
              totalPrice: canViewPrice && data.price ? (data.price * (data.quantity || order.quantity)) + ((data.additionalServices || order.additionalServices).reduce((total, service) => total + service.total, 0)) : order.totalPrice
            }
          : order
      ))
    } else {
      // Создание нового заказа
      const customer = counterparties.find(c => c.id === data.customerId)
      const concreteGrade = concreteGrades.find(g => g.id === data.concreteGradeId)
      const warehouse = warehouses.find(w => w.id === data.warehouseId)
      
      // Проверяем, нуждается ли заказ в автоматическом подтверждении
      // Автоматическое подтверждение работает только для VIP контрагентов И только если заявку создает не менеджер
      const shouldAutoApprove = customer?.autoApprove === true && user?.role !== 'manager'
      
      const newOrder: ConcreteOrder = {
        id: Date.now().toString(),
        customerId: data.customerId || '',
        customerName: customer?.name || 'Неизвестный контрагент',
        concreteGradeId: data.concreteGradeId || '',
        concreteGradeName: concreteGrade?.name || 'Неизвестная марка',
        quantity: data.quantity || 0,
        warehouseId: data.warehouseId || '',
        warehouseName: warehouse?.name || 'Неизвестный склад',
        deliveryObject: data.deliveryObject || '',
        deliveryAddress: data.deliveryAddress || '',
        deliveryDateTime: data.deliveryDateTime || new Date().toISOString(),
        price: data.price,
        totalPrice: canViewPrice && data.price && data.quantity && data.additionalServices ? (data.price * data.quantity) + data.additionalServices.reduce((total, service) => total + service.total, 0) : undefined,
        additionalServices: data.additionalServices || [],
        status: shouldAutoApprove ? 'confirmed' : 'pending', // Автоматическое подтверждение для VIP клиентов
        priority: 'low', // По умолчанию низкий приоритет, директор установит нужный
        notes: data.notes,
        createdBy: user!.id,
        createdByName: user!.fullName || user!.login,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }
      setOrders(prev => [...prev, newOrder])
    }
    setIsModalOpen(false)
    setEditingOrder(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingOrder(null)
  }

  return (
    <PageLayout
      title="Заказы бетона"
      subtitle="Управление заказами на производство и доставку бетона"
    >
      <div className="space-y-6">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-mono-900">Заказы бетона</h2>
              <p className="text-mono-600">Всего: {filteredOrders.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <button 
              onClick={handleAdd}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Создать заказ</span>
            </button>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg border border-mono-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  placeholder="Поиск по покупателю, объекту, адресу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Фильтры */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              >
                <option value="all">Все статусы</option>
                {Object.entries(ORDER_STATUSES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              >
                <option value="all">Все приоритеты</option>
                {Object.entries(ORDER_PRIORITIES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Отображение заказов */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-mono-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-900 mb-2">Заказы не найдены</h3>
            <p className="text-mono-500">
              {orders.length === 0 
                ? 'Создайте первый заказ для начала работы' 
                : 'Попробуйте изменить параметры поиска'
              }
            </p>
          </div>
        ) : viewMode === 'list' ? (
          /* Табличный вид */
          <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Заказ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Покупатель
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Марка / Количество
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Склад
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Доставка
                    </th>
                    {canViewPrice && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                        Цена
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Создатель
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-mono-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-mono-900">#{order.id}</div>
                        <div className="text-sm text-mono-500">{order.deliveryObject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-mono-900">{order.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-mono-900">{order.concreteGradeName}</div>
                        <div className="text-sm text-mono-500">{order.quantity} м³</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-mono-900">{order.warehouseName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-mono-900">
                          {new Date(order.deliveryDateTime).toLocaleDateString('ru-RU')}
                        </div>
                        <div className="text-sm text-mono-500">
                          {new Date(order.deliveryDateTime).toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      {canViewPrice && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                          {order.totalPrice ? `${order.totalPrice.toLocaleString('ru-RU')} ₸` : '—'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{ORDER_STATUSES[order.status]}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-mono-400 mr-2" />
                          <span>{order.createdByName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleView(order)}
                            className="text-black hover:text-black"
                            title="Просмотр"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user?.role === 'director' && order.status === 'pending' && (
                            <button 
                              onClick={() => handleApprove(order)}
                              className="text-mono-600 hover:text-black"
                              title="Подтвердить заявку"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {user?.role === 'director' && order.status === 'pending' && (
                            <button 
                              onClick={() => handleSetPriority(order)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Установить приоритет"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </button>
                          )}
                          {(user?.role === 'director' || user?.role === 'accountant') && order.status === 'pending' && (
                            <button 
                              onClick={() => handleEdit(order)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Редактировать"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {(user?.role === 'director' || user?.role === 'accountant') && order.status === 'pending' && (
                            <button 
                              onClick={() => handleDelete(order.id)}
                              className="text-mono-600 hover:text-black"
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Карточный вид */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200 relative">
                {/* Кнопки действий в правом верхнем углу */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button 
                    onClick={() => handleView(order)}
                    className="p-1 text-black hover:text-black rounded hover:bg-mono-50 transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {user?.role === 'director' && order.status === 'pending' && (
                    <button 
                      onClick={() => handleApprove(order)}
                      className="p-1 text-mono-600 hover:text-mono-900 rounded hover:bg-mono-50 transition-colors duration-200"
                      title="Подтвердить заявку"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {user?.role === 'director' && order.status === 'pending' && (
                    <button 
                      onClick={() => handleSetPriority(order)}
                      className="p-1 text-orange-600 hover:text-orange-900 rounded hover:bg-orange-50 transition-colors duration-200"
                      title="Установить приоритет"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </button>
                  )}
                  {(user?.role === 'director' || user?.role === 'accountant') && order.status === 'pending' && (
                    <button 
                      onClick={() => handleEdit(order)}
                      className="p-1 text-indigo-600 hover:text-indigo-900 rounded hover:bg-indigo-50 transition-colors duration-200"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {(user?.role === 'director' || user?.role === 'accountant') && order.status === 'pending' && (
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="p-1 text-mono-600 hover:text-black rounded hover:bg-mono-50 transition-colors duration-200"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Основная информация */}
                <div className="mb-4 pr-20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-mono-900">Заказ #{order.id}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ORDER_STATUS_COLORS[order.status]}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{ORDER_STATUSES[order.status]}</span>
                    </span>
                  </div>
                  <p className="text-sm text-mono-600 mb-2">{order.deliveryObject}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ORDER_PRIORITY_COLORS[order.priority]}`}>
                    {ORDER_PRIORITIES[order.priority]}
                  </span>
                </div>

                {/* Информация о выполнении в карточке */}
                {(order.assignedDriverName || order.assignedVehicleNumber) && (
                  <div className="mb-4 p-3 bg-mono-50 border border-green-200 rounded-lg">
                    <h5 className="text-xs font-semibold text-mono-800 mb-2">Выполнение</h5>
                    <div className="space-y-1">
                      {order.assignedDriverName && (
                        <div className="flex items-center text-xs text-mono-700">
                          <User className="h-3 w-3 mr-1" />
                          <span>{order.assignedDriverName}</span>
                        </div>
                      )}
                      {order.assignedVehicleNumber && (
                        <div className="flex items-center text-xs text-mono-700">
                          <Truck className="h-3 w-3 mr-1" />
                          <span>{order.assignedVehicleNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-mono-600">
                    <Building2 className="h-4 w-4 text-mono-400 mr-2 flex-shrink-0" />
                    <span className="truncate">{order.customerName}</span>
                  </div>

                  <div className="flex items-center text-sm text-mono-600">
                    <Package className="h-4 w-4 text-mono-400 mr-2 flex-shrink-0" />
                    <span>{order.concreteGradeName} - {order.quantity} м³</span>
                  </div>

                  <div className="flex items-center text-sm text-mono-600">
                    <Building2 className="h-4 w-4 text-mono-400 mr-2 flex-shrink-0" />
                    <span className="truncate">{order.warehouseName}</span>
                  </div>

                  <div className="flex items-center text-sm text-mono-600">
                    <Calendar className="h-4 w-4 text-mono-400 mr-2 flex-shrink-0" />
                    <span>
                      {new Date(order.deliveryDateTime).toLocaleDateString('ru-RU')} в{' '}
                      {new Date(order.deliveryDateTime).toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-mono-600">
                    <MapPin className="h-4 w-4 text-mono-400 mr-2 flex-shrink-0" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>

                  {canViewPrice && order.totalPrice && (
                    <div className="flex items-center text-sm text-mono-600">
                      <DollarSign className="h-4 w-4 text-mono-400 mr-2 flex-shrink-0" />
                      <span className="font-medium">{order.totalPrice.toLocaleString('ru-RU')} ₸</span>
                    </div>
                  )}

                  {order.additionalServices.length > 0 && (
                    <div className="text-sm text-mono-600">
                      <span className="font-medium">Услуги: </span>
                      {order.additionalServices.map(service => service.serviceName).join(', ')}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-mono-600">
                    <User className="h-4 w-4 text-mono-400 mr-2 flex-shrink-0" />
                    <span>Создан: {order.createdByName}</span>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 pt-3 border-t border-mono-200">
                    <p className="text-sm text-mono-600">
                      <strong>Примечания:</strong> {order.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно для создания/редактирования */}
        <OrderModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingOrder ? 'Редактировать заказ' : 'Создать заказ'}
          order={editingOrder}
          onSave={handleSave}
          userRole={user?.role || ''}
        />

        {/* Модальное окно для просмотра */}
        {viewingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold text-mono-900">Заказ #{viewingOrder.id}</h3>
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="text-mono-400 hover:text-mono-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-mono-700">Покупатель</label>
                      <p className="mt-1 text-sm text-mono-900">{viewingOrder.customerName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mono-700">Марка бетона</label>
                      <p className="mt-1 text-sm text-mono-900">{viewingOrder.concreteGradeName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mono-700">Количество</label>
                      <p className="mt-1 text-sm text-mono-900">{viewingOrder.quantity} м³</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mono-700">Склад</label>
                      <p className="mt-1 text-sm text-mono-900">{viewingOrder.warehouseName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mono-700">Объект доставки</label>
                      <p className="mt-1 text-sm text-mono-900">{viewingOrder.deliveryObject}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-mono-700">Адрес доставки</label>
                      <p className="mt-1 text-sm text-mono-900">{viewingOrder.deliveryAddress}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mono-700">Дата и время доставки</label>
                      <p className="mt-1 text-sm text-mono-900">
                        {new Date(viewingOrder.deliveryDateTime).toLocaleString('ru-RU')}
                      </p>
                    </div>

                    {/* Информация о выполнении заказа */}
                    {(viewingOrder.assignedDriverName || viewingOrder.assignedVehicleNumber) && (
                      <div className="bg-mono-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-mono-900 mb-3">Информация о выполнении</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {viewingOrder.assignedDriverName && (
                            <div>
                              <label className="block text-xs font-medium text-mono-800">Водитель</label>
                              <p className="mt-1 text-sm text-mono-900">{viewingOrder.assignedDriverName}</p>
                            </div>
                          )}
                          {viewingOrder.assignedVehicleNumber && (
                            <div>
                              <label className="block text-xs font-medium text-mono-800">Транспорт</label>
                              <p className="mt-1 text-sm text-mono-900">{viewingOrder.assignedVehicleNumber}</p>
                            </div>
                          )}
                          {viewingOrder.departureTime && (
                            <div>
                              <label className="block text-xs font-medium text-mono-800">Время отправления</label>
                              <p className="mt-1 text-sm text-mono-900">
                                {new Date(viewingOrder.departureTime).toLocaleString('ru-RU')}
                              </p>
                            </div>
                          )}
                          {viewingOrder.arrivalTime && (
                            <div>
                              <label className="block text-xs font-medium text-mono-800">Время прибытия</label>
                              <p className="mt-1 text-sm text-mono-900">
                                {new Date(viewingOrder.arrivalTime).toLocaleString('ru-RU')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-mono-700">Статус</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[viewingOrder.status]}`}>
                        {getStatusIcon(viewingOrder.status)}
                        <span className="ml-1">{ORDER_STATUSES[viewingOrder.status]}</span>
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mono-700">Приоритет</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ORDER_PRIORITY_COLORS[viewingOrder.priority]}`}>
                        {ORDER_PRIORITIES[viewingOrder.priority]}
                      </span>
                    </div>
                  </div>
                </div>

                {canViewPrice && viewingOrder.totalPrice && (
                  <div className="mt-6 p-4 bg-mono-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-mono-700">Общая стоимость:</span>
                      <span className="text-lg font-bold text-mono-900">
                        {viewingOrder.totalPrice.toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                  </div>
                )}

                {viewingOrder.additionalServices.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-mono-700 mb-2">Дополнительные услуги</label>
                    <div className="space-y-2">
                      {viewingOrder.additionalServices.map((service) => (
                        <div key={service.serviceId} className="flex justify-between items-center p-2 bg-mono-50 rounded">
                          <span className="text-sm text-mono-900">{service.serviceName}</span>
                          <span className="text-sm font-medium text-mono-900">
                            {service.quantity} × {canViewPrice ? `${service.pricePerUnit.toLocaleString('ru-RU')} ₸ = ${service.total.toLocaleString('ru-RU')} ₸` : 'Цена скрыта'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingOrder.notes && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-mono-700 mb-2">Примечания</label>
                    <p className="text-sm text-mono-900 bg-mono-50 p-3 rounded">{viewingOrder.notes}</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="px-4 py-2 bg-mono-300 text-mono-700 rounded-lg hover:bg-mono-400 transition-colors duration-200"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
