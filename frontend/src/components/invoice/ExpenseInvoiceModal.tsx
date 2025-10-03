import React, { useState, useEffect } from 'react'
import { ExpenseInvoice, CreateInvoiceRequest, InvoiceItem, DeliveryInfo, VehicleTiming, INVOICE_SUPPLIER, INVOICE_DEFAULT_CONTRACT, INVOICE_PREFIX } from '../../types/invoice'
import { Counterparty, Driver, Vehicle, Warehouse, Material, ConcreteGrade } from '../../types/directories'
import { ConcreteOrder } from '../../types/orders'
import { useAuthStore } from '../../stores/authStore'
import { UserRole } from '../../types/auth'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  Truck, 
  Package, 
  Clock, 
  Plus, 
  Trash2,
  Save,
  X
} from 'lucide-react'
import Modal from '../Modal'

interface ExpenseInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateInvoiceRequest) => void
  invoice?: ExpenseInvoice | null
  title: string
}

const mockConcreteGrades: ConcreteGrade[] = []
const mockCounterparties: Counterparty[] = []
const mockDrivers: Driver[] = []
const mockVehicles: Vehicle[] = []
const mockMaterials: Material[] = []
const mockWarehouses: Warehouse[] = []

export default function ExpenseInvoiceModal({
  isOpen,
  onClose,
  onSave,
  invoice,
  title
}: ExpenseInvoiceModalProps) {
  const { user } = useAuthStore()
  
  // Получаем данные из localStorage
  const [counterparties] = useLocalStorage<Counterparty[]>('counterparties', mockCounterparties)
  const [materials] = useLocalStorage<Material[]>('materials', mockMaterials)
  const [concreteGrades] = useLocalStorage<ConcreteGrade[]>('concreteGrades', mockConcreteGrades)
  const [drivers] = useLocalStorage<Driver[]>('drivers', mockDrivers)
  const [vehicles] = useLocalStorage<Vehicle[]>('vehicles', mockVehicles)
  const [warehouses] = useLocalStorage<Warehouse[]>('warehouses', mockWarehouses)
  const [orders] = useLocalStorage<ConcreteOrder[]>('orders', [])
  
  // Определяем, может ли пользователь видеть цены
  const canViewPrices = user?.role === UserRole.ACCOUNTANT || user?.role === UserRole.DIRECTOR || user?.role === UserRole.DEVELOPER
  
  // Генерируем номер накладной
  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${INVOICE_PREFIX}-${year}${month}${day}-${random}`
  }

  // Инициализируем форму
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    supplier: '',
    customerId: '',
    customerName: '',
    contract: INVOICE_DEFAULT_CONTRACT,
    seal: '',
    warehouseId: '',
    warehouseName: '',
    items: [
      {
        id: '1',
        number: 1,
        productCode: '',
        productName: '',
        quantity: 0,
        price: canViewPrices ? 0 : undefined,
        amount: canViewPrices ? 0 : undefined
      }
    ],
    delivery: {
      deliveryObject: '',
      deliveryAddress: '',
      dispatcher: user?.fullName || user?.login || '',
      driverId: '',
      driverName: '',
      vehicleId: '',
      vehicleNumber: '',
      netWeight: undefined,
      grossWeight: undefined,
      coneSlump: undefined,
      dailyVolume: undefined
    },
    timing: {
      departureFromPlant: '',
      arrivalAtObject: '',
      departureFromObject: '',
      arrivalAtPlant: ''
    },
    total: canViewPrices ? 0 : undefined,
    vatAmount: canViewPrices ? 0 : undefined,
    releasedBy: user?.fullName || user?.login || '',
    receivedBy: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        supplier: invoice.supplier,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        contract: invoice.contract,
        seal: invoice.seal,
        warehouseId: invoice.warehouseId,
        warehouseName: invoice.warehouseName,
        items: invoice.items,
        delivery: invoice.delivery,
        timing: invoice.timing,
        total: invoice.total,
        vatAmount: invoice.vatAmount,
        releasedBy: invoice.releasedBy,
        receivedBy: invoice.receivedBy
      })
    } else {
      // Создаем новую накладную
      setFormData(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber()
      }))
    }
  }, [invoice, user])

  const handleChange = (field: keyof CreateInvoiceRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          
          // Автозаполнение расходов материалов при выборе марки бетона
          if (field === 'productName') {
            const selectedGrade = concreteGrades.find(cg => cg.name === value)
            if (selectedGrade) {
              updatedItem.cementConsumption = selectedGrade.cementConsumption
              updatedItem.gravelConsumption = selectedGrade.gravelConsumption
              updatedItem.sandConsumption = selectedGrade.sandConsumption
              updatedItem.plasticizerConsumption = selectedGrade.plasticizerConsumption
            }
          }
          
          // Автоматический расчёт суммы
          if (field === 'quantity' || field === 'price') {
            if (canViewPrices && updatedItem.quantity && updatedItem.price) {
              updatedItem.amount = updatedItem.quantity * updatedItem.price
            }
          }
          
          return updatedItem
        }
        return item
      })
    }))
    
    // Пересчитываем общую сумму
    if (canViewPrices && (field === 'quantity' || field === 'price')) {
      recalculateTotal()
    }
  }

  const recalculateTotal = () => {
    const total = formData.items.reduce((sum, item) => {
      return sum + (item.amount || 0)
    }, 0)
    
    setFormData(prev => ({
      ...prev,
      total,
      vatAmount: total * 0.12 // НДС 12%
    }))
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      number: formData.items.length + 1,
      productCode: '',
      productName: '',
      quantity: 0,
      price: canViewPrices ? 0 : undefined,
      amount: canViewPrices ? 0 : undefined,
      // Инициализация полей расходов материалов
      cementConsumption: 0,
      gravelConsumption: 0,
      sandConsumption: 0,
      plasticizerConsumption: 0
    }
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (itemId: string) => {
    if (formData.items.length <= 1) return
    
    setFormData(prev => ({
      ...prev,
      items: prev.items
        .filter(item => item.id !== itemId)
        .map((item, index) => ({ ...item, number: index + 1 }))
    }))
  }

  // Функция для импорта данных из заказа
  const handleImportFromOrder = (orderId: string) => {
    const selectedOrder = orders.find(order => order.id === orderId)
    if (!selectedOrder) return

    // Находим марку бетона для получения расхода материалов
    const selectedGrade = concreteGrades.find(grade => grade.id === selectedOrder.concreteGradeId)
    
    setFormData(prev => ({
      ...prev,
      customerId: selectedOrder.customerId,
      customerName: selectedOrder.customerName,
      warehouseId: selectedOrder.warehouseId,
      warehouseName: selectedOrder.warehouseName,
      orderId: selectedOrder.id, // Сохраняем связь с заказом
      items: [{
        id: '1',
        number: 1,
        productCode: selectedGrade?.code || '',
        productName: selectedOrder.concreteGradeName,
        quantity: selectedOrder.quantity,
        price: canViewPrices ? (selectedOrder.price || 0) : undefined,
        amount: canViewPrices ? (selectedOrder.totalPrice || 0) : undefined,
        cementConsumption: selectedGrade?.cementConsumption || 0,
        gravelConsumption: selectedGrade?.gravelConsumption || 0,
        sandConsumption: selectedGrade?.sandConsumption || 0,
        plasticizerConsumption: selectedGrade?.plasticizerConsumption || 0
      }],
      delivery: {
        ...prev.delivery,
        deliveryObject: selectedOrder.deliveryObject,
        deliveryAddress: selectedOrder.deliveryAddress
      }
    }))
    
    setSelectedOrderId(orderId)
  }

  const handleDeliveryChange = (field: keyof DeliveryInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      delivery: { ...prev.delivery, [field]: value }
    }))
  }

  const handleTimingChange = (field: keyof VehicleTiming, value: string) => {
    setFormData(prev => ({
      ...prev,
      timing: { ...prev.timing, [field]: value }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    // Валидация обязательных полей
    if (!formData.supplier.trim()) newErrors.supplier = 'Выберите поставщика'
    if (!formData.customerId) newErrors.customerId = 'Выберите покупателя'
    if (!formData.warehouseId) newErrors.warehouseId = 'Выберите склад'
    if (!formData.delivery.driverId) newErrors.driverId = 'Выберите водителя'
    if (!formData.delivery.vehicleId) newErrors.vehicleId = 'Выберите автомобиль'
    if (!formData.seal.trim()) newErrors.seal = 'Укажите пломбу'
    
    // Валидация товаров
    formData.items.forEach((item, index) => {
      if (!item.productName.trim()) {
        newErrors[`item_${index}_name`] = 'Укажите наименование товара'
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Укажите количество'
      }
    })
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onSave(formData)
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString().split('T')[0],
      supplier: '',
      customerId: '',
      customerName: '',
      contract: INVOICE_DEFAULT_CONTRACT,
      seal: '',
      warehouseId: '',
      warehouseName: '',
      items: [
        {
          id: '1',
          number: 1,
          productCode: '',
          productName: '',
          quantity: 0,
          price: canViewPrices ? 0 : undefined,
          amount: canViewPrices ? 0 : undefined
        }
      ],
      delivery: {
        deliveryObject: '',
        deliveryAddress: '',
        dispatcher: user?.fullName || user?.login || '',
        driverId: '',
        driverName: '',
        vehicleId: '',
        vehicleNumber: '',
        netWeight: undefined,
        grossWeight: undefined,
        coneSlump: undefined,
        dailyVolume: undefined
      },
      timing: {
        departureFromPlant: '',
        arrivalAtObject: '',
        departureFromObject: '',
        arrivalAtPlant: ''
      },
      total: canViewPrices ? 0 : undefined,
      vatAmount: canViewPrices ? 0 : undefined,
      releasedBy: user?.fullName || user?.login || '',
      receivedBy: ''
    })
    setErrors({})
    setSelectedOrderId('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="xl">
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Блок импорта из заказа */}
          {!invoice && (
            <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3">
                Импорт данных из заказа
              </h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-1">
                    Выберите заказ для автоматического заполнения
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => {
                      setSelectedOrderId(e.target.value)
                      if (e.target.value) {
                        handleImportFromOrder(e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white"
                  >
                    <option value="">-- Выберите заказ --</option>
                    {orders
                      .filter(order => order.status === 'confirmed' || order.status === 'in_production')
                      .map(order => (
                        <option key={order.id} value={order.id}>
                          {order.customerName} - {order.concreteGradeName} ({order.quantity}м³) - {order.deliveryObject}
                        </option>
                      ))}
                  </select>
                </div>
                {selectedOrderId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderId('')
                      // Сброс формы к начальному состоянию
                      setFormData({
                        invoiceNumber: generateInvoiceNumber(),
                        invoiceDate: new Date().toISOString().split('T')[0],
                        supplier: '',
                        customerId: '',
                        customerName: '',
                        contract: INVOICE_DEFAULT_CONTRACT,
                        seal: '',
                        warehouseId: '',
                        warehouseName: '',
                        items: [{
                          id: '1',
                          number: 1,
                          productCode: '',
                          productName: '',
                          quantity: 0,
                          price: canViewPrices ? 0 : undefined,
                          amount: canViewPrices ? 0 : undefined
                        }],
                        delivery: {
                          deliveryObject: '',
                          deliveryAddress: '',
                          dispatcher: user?.fullName || user?.login || '',
                          driverId: '',
                          driverName: '',
                          vehicleId: '',
                          vehicleNumber: '',
                          netWeight: undefined,
                          grossWeight: undefined,
                          coneSlump: undefined,
                          dailyVolume: undefined
                        },
                        timing: {
                          departureFromPlant: '',
                          arrivalAtObject: '',
                          departureFromObject: '',
                          arrivalAtPlant: ''
                        },
                        releasedBy: user?.fullName || user?.login || '',
                        receivedBy: ''
                      })
                    }}
                    className="px-4 py-2 bg-mono-600 text-white rounded-md hover:bg-mono-700 transition-colors"
                  >
                    Очистить
                  </button>
                )}
              </div>
              {selectedOrderId && (
                <p className="text-sm text-black mt-2">
                  ✅ Данные заказа импортированы. Проверьте и при необходимости отредактируйте поля.
                </p>
              )}
            </div>
          )}

          {/* Шапка документа */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">Номер накладной</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                className="w-full px-3 py-2 border border-mono-300 rounded-md bg-mono-50"
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">Дата накладной</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleChange('invoiceDate', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">Поставщик *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <select
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.supplier ? 'border-mono-500' : 'border-mono-300'} rounded-md`}
                >
                  <option value="">Выберите поставщика</option>
                  {counterparties.filter(c => c.type === 'supplier' && c.isActive).map(supplier => (
                    <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                  ))}
                </select>
                {errors.supplier && <p className="mt-1 text-sm text-mono-600">{errors.supplier}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">Покупатель *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <select
                  value={formData.customerId}
                  onChange={(e) => {
                    const customer = counterparties.find(c => c.id === e.target.value)
                    handleChange('customerId', e.target.value)
                    handleChange('customerName', customer?.name || '')
                  }}
                  className={`pl-10 w-full px-3 py-2 border ${errors.customerId ? 'border-mono-500' : 'border-mono-300'} rounded-md`}
                >
                  <option value="">Выберите покупателя</option>
                  {counterparties.filter(c => c.isActive).map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
                {errors.customerId && <p className="mt-1 text-sm text-mono-600">{errors.customerId}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">Договор</label>
              <input
                type="text"
                value={formData.contract}
                onChange={(e) => handleChange('contract', e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">Пломба *</label>
              <input
                type="text"
                value={formData.seal}
                onChange={(e) => handleChange('seal', e.target.value)}
                className={`w-full px-3 py-2 border ${errors.seal ? 'border-mono-500' : 'border-mono-300'} rounded-md`}
                placeholder="Введите номер пломбы"
              />
              {errors.seal && <p className="mt-1 text-sm text-mono-600">{errors.seal}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">Склад *</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
              <select
                value={formData.warehouseId}
                onChange={(e) => {
                  const warehouse = warehouses.find(w => w.id === e.target.value)
                  handleChange('warehouseId', e.target.value)
                  handleChange('warehouseName', warehouse?.name || '')
                }}
                className={`pl-10 w-full px-3 py-2 border ${errors.warehouseId ? 'border-mono-500' : 'border-mono-300'} rounded-md`}
              >
                <option value="">Выберите склад</option>
                {warehouses.filter(w => w.isActive).map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
              {errors.warehouseId && <p className="mt-1 text-sm text-mono-600">{errors.warehouseId}</p>}
            </div>
          </div>

          {/* Таблица товаров */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-mono-900">Товары</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить товар
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-mono-300">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="border border-mono-300 px-4 py-2 text-left text-sm font-medium text-mono-900">№</th>
                    <th className="border border-mono-300 px-4 py-2 text-left text-sm font-medium text-mono-900">Код марки</th>
                    <th className="border border-mono-300 px-4 py-2 text-left text-sm font-medium text-mono-900">Марка бетона</th>
                    <th className="border border-mono-300 px-4 py-2 text-left text-sm font-medium text-mono-900">Количество</th>
                    {canViewPrices && (
                      <>
                        <th className="border border-mono-300 px-4 py-2 text-left text-sm font-medium text-mono-900">Цена</th>
                        <th className="border border-mono-300 px-4 py-2 text-left text-sm font-medium text-mono-900">Сумма</th>
                      </>
                    )}
                    <th className="border border-mono-300 px-4 py-2 text-left text-sm font-medium text-mono-900">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-mono-300 px-4 py-2">
                        <input
                          type="text"
                          value={item.number}
                          className="w-full text-center bg-mono-50 border-0"
                          readOnly
                        />
                      </td>
                      <td className="border border-mono-300 px-4 py-2">
                        <input
                          type="text"
                          value={item.productCode}
                          onChange={(e) => handleItemChange(item.id, 'productCode', e.target.value)}
                          className="w-full border-0 focus:ring-0"
                          placeholder="Код марки"
                        />
                      </td>
                      <td className="border border-mono-300 px-4 py-2">
                        <select
                          value={item.productName}
                          onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                          className={`w-full border-0 focus:ring-0 ${errors[`item_${index}_name`] ? 'bg-mono-50' : ''}`}
                        >
                          <option value="">Выберите марку бетона</option>
                          {concreteGrades.filter(cg => cg.isActive).map(concreteGrade => (
                            <option key={concreteGrade.id} value={concreteGrade.name}>{concreteGrade.name}</option>
                          ))}
                        </select>
                        {errors[`item_${index}_name`] && <p className="text-xs text-mono-600">{errors[`item_${index}_name`]}</p>}
                      </td>
                      <td className="border border-mono-300 px-4 py-2">
                        <input
                          type="number"
                          step="0.001"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className={`w-full border-0 focus:ring-0 ${errors[`item_${index}_quantity`] ? 'bg-mono-50' : ''}`}
                          placeholder="0,000"
                        />
                        {errors[`item_${index}_quantity`] && <p className="text-xs text-mono-600">{errors[`item_${index}_quantity`]}</p>}
                      </td>
                      {canViewPrices && (
                        <>
                          <td className="border border-mono-300 px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.price || ''}
                              onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full border-0 focus:ring-0"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="border border-mono-300 px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.amount || ''}
                              className="w-full border-0 bg-mono-50"
                              readOnly
                            />
                          </td>
                        </>
                      )}
                      <td className="border border-mono-300 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={formData.items.length <= 1}
                          className="text-mono-600 hover:text-black disabled:text-mono-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Блок доставки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-mono-900">Доставка</h3>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Объект доставки</label>
                <input
                  type="text"
                  value={formData.delivery.deliveryObject}
                  onChange={(e) => handleDeliveryChange('deliveryObject', e.target.value)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md"
                  placeholder="Название объекта"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">
                  Адрес доставки (из 2ГИС) *
                </label>
                <textarea
                  value={formData.delivery.deliveryAddress}
                  onChange={(e) => handleDeliveryChange('deliveryAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md resize-none"
                  placeholder="Скопируйте адрес из 2ГИС для навигации водителя"
                  rows={3}
                />
                <p className="text-xs text-mono-500 mt-1">
                  Водитель сможет нажать на этот адрес для навигации
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Диспетчер</label>
                <input
                  type="text"
                  value={formData.delivery.dispatcher}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md bg-mono-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Водитель *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                  <select
                    value={formData.delivery.driverId}
                    onChange={(e) => {
                      const driver = drivers.find(d => d.id === e.target.value)
                      handleDeliveryChange('driverId', e.target.value)
                      handleDeliveryChange('driverName', driver?.fullName || '')
                    }}
                    className={`pl-10 w-full px-3 py-2 border ${errors.driverId ? 'border-mono-500' : 'border-mono-300'} rounded-md`}
                  >
                    <option value="">Выберите водителя</option>
                    {drivers.filter(d => d.isActive).map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.fullName}</option>
                    ))}
                  </select>
                  {errors.driverId && <p className="mt-1 text-sm text-mono-600">{errors.driverId}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Номер автомобиля *</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                  <select
                    value={formData.delivery.vehicleId}
                    onChange={(e) => {
                      const vehicle = vehicles.find(v => v.id === e.target.value)
                      handleDeliveryChange('vehicleId', e.target.value)
                      handleDeliveryChange('vehicleNumber', vehicle?.licensePlate || '')
                    }}
                    className={`pl-10 w-full px-3 py-2 border ${errors.vehicleId ? 'border-mono-500' : 'border-mono-300'} rounded-md`}
                  >
                    <option value="">Выберите автомобиль</option>
                    {vehicles.filter(v => v.isActive).map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.licensePlate}</option>
                    ))}
                  </select>
                  {errors.vehicleId && <p className="mt-1 text-sm text-mono-600">{errors.vehicleId}</p>}
                </div>
              </div>
            </div>
            
            {/* Время движения автомобиля */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-mono-900">Время движения автомобиля</h3>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Время убытия с завода</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                  <input
                    type="time"
                    value={formData.timing.departureFromPlant}
                    onChange={(e) => handleTimingChange('departureFromPlant', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Время прибытия на объект</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                  <input
                    type="time"
                    value={formData.timing.arrivalAtObject}
                    onChange={(e) => handleTimingChange('arrivalAtObject', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Время убытия с объекта</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                  <input
                    type="time"
                    value={formData.timing.departureFromObject}
                    onChange={(e) => handleTimingChange('departureFromObject', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Время прибытия на завод</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                  <input
                    type="time"
                    value={formData.timing.arrivalAtPlant}
                    onChange={(e) => handleTimingChange('arrivalAtPlant', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Итоги (только для бухгалтера/директора) */}
          {canViewPrices && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-mono-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">Итого</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total || ''}
                  onChange={(e) => handleChange('total', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">В том числе НДС</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.vatAmount || ''}
                  onChange={(e) => handleChange('vatAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-mono-300 rounded-md"
                />
              </div>
            </div>
          )}

          {/* Подписи */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">Выпустил</label>
              <input
                type="text"
                value={formData.releasedBy}
                onChange={(e) => handleChange('releasedBy', e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">Получено</label>
              <input
                type="text"
                value={formData.receivedBy}
                onChange={(e) => handleChange('receivedBy', e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-md"
                placeholder="Подпись получателя"
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-mono-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-mono-300 rounded-md text-mono-700 hover:bg-mono-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-black text-white rounded-md hover:bg-black"
            >
              <Save className="h-4 w-4 mr-2" />
              {invoice ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
