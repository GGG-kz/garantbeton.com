import { useState, useEffect } from 'react'
import { ConcreteOrder, CreateOrderRequest, UpdateOrderRequest, AdditionalService, OrderAdditionalService, EMPTY_ADDITIONAL_SERVICES } from '../../types/orders'
import { Counterparty, ConcreteGrade, Warehouse } from '../../types/directories'
import { Building2, Package, MapPin, Calendar, DollarSign, Plus, Trash2, Clock, AlertCircle } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateOrderRequest | UpdateOrderRequest) => void
  order?: ConcreteOrder | null
  title: string
  userRole: string
}

// Пустые массивы - данные хранятся в localStorage
const emptyCounterparties: Counterparty[] = []

const emptyConcreteGrades: ConcreteGrade[] = []

const emptyWarehouses: Warehouse[] = []

export default function OrderModal({ isOpen, onClose, onSave, order, title, userRole }: OrderModalProps) {
  const [counterparties] = useLocalStorage<Counterparty[]>('counterparties', emptyCounterparties)
  const [concreteGrades] = useLocalStorage<ConcreteGrade[]>('concreteGrades', emptyConcreteGrades)
  const [warehouses] = useLocalStorage<Warehouse[]>('warehouses', emptyWarehouses)
  const [additionalServices] = useLocalStorage<AdditionalService[]>('additionalServices', EMPTY_ADDITIONAL_SERVICES)
  
  const [formData, setFormData] = useState<CreateOrderRequest>({
    customerId: '',
    concreteGradeId: '',
    quantity: 0,
    warehouseId: '',
    deliveryObject: '',
    deliveryAddress: '',
    deliveryDateTime: '',
    price: undefined,
    additionalServices: [],
    priority: 'low',
    notes: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newServiceId, setNewServiceId] = useState('')

  // Определяем, может ли пользователь видеть/редактировать цену
  const canViewPrice = userRole === 'director' || userRole === 'accountant' || userRole === 'manager'
  
  // Определяем, может ли пользователь видеть цены дополнительных услуг
  const canViewServicePrices = userRole === 'director' || userRole === 'accountant' || userRole === 'manager'

  useEffect(() => {
    if (order) {
      setFormData({
        customerId: order.customerId,
        concreteGradeId: order.concreteGradeId,
        quantity: order.quantity,
        warehouseId: order.warehouseId,
        deliveryObject: order.deliveryObject,
        deliveryAddress: order.deliveryAddress,
        deliveryDateTime: order.deliveryDateTime,
        price: order.price,
        additionalServices: order.additionalServices,
        priority: order.priority,
        notes: order.notes || ''
      })
    } else {
      setFormData({
        customerId: '',
        concreteGradeId: '',
        quantity: 0,
        warehouseId: '',
        deliveryObject: '',
        deliveryAddress: '',
        deliveryDateTime: '',
        price: undefined,
        additionalServices: [],
        priority: 'low',
        notes: ''
      })
    }
    setErrors({})
  }, [order, isOpen])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Если изменилось количество бетона, обновляем количество для услуг доставки
      if (field === 'quantity') {
        const updatedServices = newData.additionalServices.map(service => {
          const serviceInfo = additionalServices.find(s => s.id === service.serviceId)
          if (serviceInfo && serviceInfo.unit === 'per_m3') {
            return { ...service, quantity: value, total: service.pricePerUnit * value }
          }
          return service
        })
        newData.additionalServices = updatedServices
      }
      
      return newData
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddService = () => {
    if (!newServiceId) return
    
    const service = additionalServices.find(s => s.id === newServiceId)
    if (!service) return
    
    // Проверяем, не добавлена ли уже эта услуга
    if (formData.additionalServices.some(s => s.serviceId === newServiceId)) {
      alert('Эта услуга уже добавлена')
      return
    }
    
    // Для услуг доставки (per_m3) устанавливаем количество равное количеству бетона
    const initialQuantity = service.unit === 'per_m3' ? formData.quantity : 1
    
    const newService: OrderAdditionalService = {
      serviceId: service.id,
      serviceName: service.name,
      quantity: initialQuantity,
      pricePerUnit: service.price,
      unit: service.unit as 'per_m3' | 'per_hour' | 'per_order' | 'fixed',
      total: service.price * initialQuantity
    }
    
    handleChange('additionalServices', [...formData.additionalServices, newService])
    setNewServiceId('')
  }

  const handleRemoveService = (serviceId: string) => {
    handleChange('additionalServices', formData.additionalServices.filter(s => s.serviceId !== serviceId))
  }

  const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
    const updatedServices = formData.additionalServices.map(service => {
      if (service.serviceId === serviceId) {
        return { ...service, quantity, total: service.pricePerUnit * quantity }
      }
      return service
    })
    handleChange('additionalServices', updatedServices)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}

    if (!formData.customerId) newErrors.customerId = 'Выберите покупателя'
    if (!formData.concreteGradeId) newErrors.concreteGradeId = 'Выберите марку бетона'
    if (formData.quantity <= 0) newErrors.quantity = 'Количество должно быть больше 0'
    if (!formData.warehouseId) newErrors.warehouseId = 'Выберите склад'
    if (!formData.deliveryObject.trim()) newErrors.deliveryObject = 'Укажите объект доставки'
    if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Укажите адрес доставки'
    if (!formData.deliveryDateTime) newErrors.deliveryDateTime = 'Укажите дату и время доставки'

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSave(formData)
    }
  }

  const getTotalAdditionalServices = () => {
    return formData.additionalServices.reduce((total, service) => total + service.total, 0)
  }

  const getTotalOrderPrice = () => {
    const basePrice = formData.price ? formData.price * formData.quantity : 0
    return basePrice + getTotalAdditionalServices()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-mono-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-mono-400 hover:text-mono-600 transition-colors duration-200"
            >
              <span className="sr-only">Закрыть</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Покупатель */}
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Покупатель <span className="text-mono-500">*</span>
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleChange('customerId', e.target.value)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                >
                  <option value="">Выберите покупателя</option>
                  {counterparties.filter(c => c.type === 'client' && c.isActive).map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {errors.customerId && <p className="mt-1 text-sm text-mono-600">{errors.customerId}</p>}
              </div>

              {/* Марка бетона */}
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Марка бетона <span className="text-mono-500">*</span>
                </label>
                <select
                  value={formData.concreteGradeId}
                  onChange={(e) => handleChange('concreteGradeId', e.target.value)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                >
                  <option value="">Выберите марку бетона</option>
                  {concreteGrades.filter(g => g.isActive).map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
                {errors.concreteGradeId && <p className="mt-1 text-sm text-mono-600">{errors.concreteGradeId}</p>}
              </div>

              {/* Количество */}
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Количество (м³) <span className="text-mono-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                />
                {errors.quantity && <p className="mt-1 text-sm text-mono-600">{errors.quantity}</p>}
              </div>

              {/* Склад */}
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Склад <span className="text-mono-500">*</span>
                </label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => handleChange('warehouseId', e.target.value)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                >
                  <option value="">Выберите склад</option>
                  {warehouses.filter(w => w.isActive).map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
                {errors.warehouseId && <p className="mt-1 text-sm text-mono-600">{errors.warehouseId}</p>}
              </div>
            </div>

            {/* Объект доставки */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Объект доставки <span className="text-mono-500">*</span>
              </label>
              <input
                type="text"
                value={formData.deliveryObject}
                onChange={(e) => handleChange('deliveryObject', e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                placeholder="Например: Строительство жилого дома"
              />
              {errors.deliveryObject && <p className="mt-1 text-sm text-mono-600">{errors.deliveryObject}</p>}
            </div>

            {/* Адрес доставки */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Адрес доставки <span className="text-mono-500">*</span>
              </label>
              <input
                type="text"
                value={formData.deliveryAddress}
                onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                placeholder="Скопируйте адрес из 2ГИС"
              />
              {errors.deliveryAddress && <p className="mt-1 text-sm text-mono-600">{errors.deliveryAddress}</p>}
            </div>

            {/* Дата и время доставки */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Дата и время доставки <span className="text-mono-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.deliveryDateTime}
                onChange={(e) => handleChange('deliveryDateTime', e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              />
              {errors.deliveryDateTime && <p className="mt-1 text-sm text-mono-600">{errors.deliveryDateTime}</p>}
            </div>

            {/* Цена (только для директора, бухгалтера и менеджера) */}
            {canViewPrice && (
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Цена за м³ (₸)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                />
              </div>
            )}

            {/* Дополнительные услуги */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Дополнительные услуги
              </label>
              
              {/* Выбор услуги */}
              <div className="flex gap-2 mb-4">
                <select
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                >
                  <option value="">Выберите услугу</option>
                  {additionalServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}{canViewServicePrices ? ` - ${service.price} ₸/${service.unit === 'fixed' ? 'заказ' : service.unit}` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddService}
                  disabled={!newServiceId}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-black disabled:bg-mono-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Список добавленных услуг */}
              {formData.additionalServices.length > 0 && (
                <div className="space-y-2">
                  {formData.additionalServices.map(service => (
                    <div key={service.serviceId} className="flex items-center justify-between p-3 bg-mono-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-mono-900">{service.serviceName}</div>
                        <div className="text-sm text-mono-600">
                          {canViewServicePrices ? `${service.pricePerUnit} ₸/${additionalServices.find(s => s.id === service.serviceId)?.unit === 'fixed' ? 'заказ' : 'м³'}` : 'Цена скрыта'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Для услуг доставки (per_m3) показываем автоматическое количество */}
                        {additionalServices.find(s => s.id === service.serviceId)?.unit === 'per_m3' ? (
                          <span className="text-sm text-mono-600">
                            {service.quantity} м³ <span className="text-xs text-mono-500">(автоматически по количеству бетона)</span>
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            value={service.quantity}
                            onChange={(e) => handleServiceQuantityChange(service.serviceId, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 text-sm border border-mono-300 rounded focus:outline-none focus:ring-1 focus:ring-mono-500"
                          />
                        )}
                        
                        <span className="text-sm font-medium text-mono-900">
                          {canViewServicePrices ? `${service.total.toLocaleString('ru-RU')} ₸` : 'Сумма скрыта'}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service.serviceId)}
                          className="text-mono-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Итого по дополнительным услугам */}
                  <div className="flex justify-between items-center p-3 bg-mono-50 rounded-lg">
                    <span className="font-medium text-mono-900">Итого по услугам:</span>
                    <span className="font-bold text-black">
                      {canViewServicePrices ? `${getTotalAdditionalServices().toLocaleString('ru-RU')} ₸` : 'Сумма скрыта'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Примечания */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Примечания
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                placeholder="Дополнительная информация..."
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-3 pt-6 border-t border-mono-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-mono-700 bg-mono-100 rounded-md hover:bg-mono-200 transition-colors duration-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-black transition-colors duration-200"
              >
                {order ? 'Сохранить изменения' : 'Создать заказ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
