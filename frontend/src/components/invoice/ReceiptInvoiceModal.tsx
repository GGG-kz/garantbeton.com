import React, { useState } from 'react'
import { ReceiptInvoice, CreateReceiptInvoiceRequest, ReceiptInvoiceItem } from '../../types/receiptInvoice'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useAuthStore } from '../../stores/authStore'
import { Truck, Weight, Plus, Trash2, Package, Building2, User } from 'lucide-react'
import Modal from '../Modal'
import ScalesWidget from '../ScalesWidget'

interface ReceiptInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateReceiptInvoiceRequest) => void
  invoice?: ReceiptInvoice | null
  title: string
}

export default function ReceiptInvoiceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  invoice, 
  title 
}: ReceiptInvoiceModalProps) {
  const { user } = useAuthStore()
  
  // Справочники из localStorage
  const [drivers] = useLocalStorage<any[]>('drivers', [])
  const [vehiclesFromStorage] = useLocalStorage<any[]>('vehicles', [])
  
  // Справочники
  const mockVehicles = [
    {
      id: 'vehicle-1',
      type: 'concrete_mixer',
      model: 'Камаз-53215',
      licensePlate: '01ABC123',
      capacity: 6,
      isHired: false,
      status: 'available',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'vehicle-2',
      type: 'dump_truck',
      model: 'МАЗ-6312',
      licensePlate: '02DEF456',
      capacity: 8,
      isHired: false,
      status: 'available',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'vehicle-3',
      type: 'concrete_mixer',
      model: 'ЗИЛ-130',
      licensePlate: '03GHI789',
      capacity: 5,
      isHired: true,
      status: 'available',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  const [vehicles] = useLocalStorage<any[]>('vehicles', mockVehicles)
  
  const mockCounterparties: any[] = []
  
  const [counterparties] = useLocalStorage<any[]>('counterparties', mockCounterparties)
  
  const mockMaterials: any[] = []
  
  const [materials] = useLocalStorage<any[]>('materials', mockMaterials)
  const [warehouses] = useLocalStorage<any[]>('warehouses', [])
  
  const mockWarehouses: any[] = []
  
  const [allWarehouses] = useLocalStorage<any[]>('warehouses', mockWarehouses)

  // Состояние формы
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    warehouse: '',
    seal: '',
    receivedBy: user?.login || user?.fullName || '',
    items: [] as ReceiptInvoiceItem[]
  })

  // Состояние весов
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('warehouse-1')
  const [currentWeight, setCurrentWeight] = useState<number | null>(null)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)

  // Получаем данные выбранного склада
  const selectedWarehouse = allWarehouses.find(w => w.id === selectedWarehouseId)

  // Инициализация формы
  React.useEffect(() => {
    if (isOpen) {
      if (invoice) {
        // Редактирование существующей накладной
        const processedItems = invoice.items.map(item => {
          // Пересчитываем НЕТТО если есть и БРУТТО и ТАРА
          if (item.bruttoWeight && item.taraWeight) {
            const netWeight = item.bruttoWeight - item.taraWeight
            let finalWeight = netWeight
            
            // Пересчитываем итоговый вес с учетом влажности
            if (item.humidity && item.humidity > 0) {
              finalWeight = netWeight - (netWeight * item.humidity / 100)
            }
            
            console.log(`🔄 ПЕРЕСЧЕТ при загрузке: БРУТТО=${item.bruttoWeight}, ТАРА=${item.taraWeight}, НЕТТО=${netWeight}, Влажность=${item.humidity}%, Итоговый=${finalWeight}`)
            
            return {
              ...item,
              netWeight,
              finalWeight,
              weighingStatus: 'tara_done' as const
            }
          }
          
          return item
        })
        
        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          warehouse: invoice.warehouse,
          seal: invoice.seal || '',
          receivedBy: invoice.receivedBy,
          items: processedItems
        })
        setSelectedWarehouseId(invoice.warehouse)
      } else {
        // Создание новой накладной
        setFormData({
          invoiceNumber: generateInvoiceNumber(),
          invoiceDate: new Date().toISOString().split('T')[0],
          warehouse: '',
          seal: '',
          receivedBy: user?.login || user?.fullName || '',
          items: []
        })
        setSelectedWarehouseId('warehouse-1')
      }
      setCurrentWeight(null)
      setSelectedItemIndex(null)
    }
  }, [isOpen, invoice, user])

  // Генерация номера накладной
  const generateInvoiceNumber = () => {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ПН-${dateStr}-${randomNum}`
  }

  // Получение номера машины водителя
  const getDriverVehicleNumber = (): string => {
    if (user?.role !== 'driver') return ''
    
    // Найдем водителя по логину
    const driver = drivers.find(d => d.login === user.login)
    if (!driver || !driver.vehicleIds?.length) return ''
    
    // Найдем первую машину водителя
    const vehicle = vehiclesFromStorage.find(v => driver.vehicleIds.includes(v.id))
    return vehicle?.licensePlate || ''
  }

  // Добавление новой позиции
  const addItem = () => {
    const driverVehicleNumber = getDriverVehicleNumber()
    
    const newItem: ReceiptInvoiceItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      vehicleNumber: driverVehicleNumber, // Автоматически заполняем номер машины водителя
      supplier: '',
      buyer: '',
      material: '',
      weighingStatus: 'pending'
    }
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  // Обновление позиции
  const updateItem = (index: number, field: keyof ReceiptInvoiceItem, value: any) => {
    console.log(`🔍 ОТЛАДКА updateItem: index=${index}, field=${field}, value=${value}`)
    
    // Дополнительная отладка для supplier и material
    if (field === 'supplier') {
      const supplier = counterparties.find(cp => cp.id === value)
      console.log(`🔍 ОТЛАДКА: Выбран поставщик ID="${value}", название="${supplier?.name || 'НЕ НАЙДЕН'}"`)
    }
    if (field === 'material') {
      const material = materials.find(m => m.id === value)
      console.log(`🔍 ОТЛАДКА: Выбран материал ID="${value}", название="${material?.name || 'НЕ НАЙДЕН'}"`)
    }
    
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    console.log(`🔍 ОТЛАДКА: Обновленный элемент:`, updatedItems[index])
    
    // Автоматический расчет нетто при изменении весов
    if (field === 'bruttoWeight' || field === 'taraWeight') {
      const item = updatedItems[index]
      if (item.bruttoWeight && item.taraWeight) {
        item.netWeight = item.bruttoWeight - item.taraWeight
        item.weighingStatus = 'tara_done'
        
        // Пересчитываем итоговый вес с учетом влажности
        if (item.humidity) {
          item.finalWeight = item.netWeight - (item.netWeight * item.humidity / 100)
        } else {
          item.finalWeight = item.netWeight
        }
      } else if (item.bruttoWeight) {
        item.weighingStatus = 'brutto_done'
      }
    }
    
    // Пересчет итогового веса при изменении влажности
    if (field === 'humidity' && updatedItems[index].netWeight) {
      const item = updatedItems[index]
      item.finalWeight = item.netWeight! - (item.netWeight! * value / 100)
    }
    
    setFormData(prev => {
      const newFormData = { ...prev, items: updatedItems }
      console.log(`🔍 ОТЛАДКА: Устанавливаем новое состояние formData:`, newFormData)
      return newFormData
    })
    
    // Принудительное обновление для отладки
    setTimeout(() => {
      console.log(`🔍 ОТЛАДКА: Проверяем текущее состояние formData через 100мс:`, formData)
    }, 100)
  }

  // Удаление позиции
  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, items: updatedItems }))
  }

  // Получение веса БРУТТО с реальных весов
  const handleGetBruttoWeight = async (itemIndex: number) => {
    if (!selectedWarehouse?.scalesEnabled) {
      alert('Весы не настроены для этого склада')
      return
    }
    
    try {
      console.log(`⚖️ Запрос веса БРУТТО с весов ${selectedWarehouse?.scalesModel}`)
      // TODO: Реализовать реальное получение веса с весов
      alert('Функция получения веса БРУТТО будет реализована при подключении к реальным весам')
    } catch (error) {
      console.error('Ошибка получения веса БРУТТО:', error)
      alert('Ошибка получения веса с весов')
    }
  }

  // Получение веса ТАРА с реальных весов
  const handleGetTaraWeight = async (itemIndex: number) => {
    if (!selectedWarehouse?.scalesEnabled) {
      alert('Весы не настроены для этого склада')
      return
    }
    
    try {
      console.log(`⚖️ Запрос веса ТАРА с весов ${selectedWarehouse?.scalesModel}`)
      // TODO: Реализовать реальное получение веса с весов
      alert('Функция получения веса ТАРА будет реализована при подключении к реальным весам')
    } catch (error) {
      console.error('Ошибка получения веса ТАРА:', error)
      alert('Ошибка получения веса с весов')
    }
  }

  // Получение веса с реальных весов
  const handleWeightRequest = async () => {
    if (!selectedWarehouse?.scalesEnabled) {
      alert('Весы не настроены для этого склада')
      return
    }
    
    try {
      // Здесь будет реальное подключение к весам через COM-порт
      console.log(`⚖️ Запрос веса с весов ${selectedWarehouse?.scalesModel} (${selectedWarehouse?.scalesComPort})`)
      // TODO: Реализовать реальное подключение к весам
    } catch (error) {
      console.error('Ошибка получения веса:', error)
      alert('Ошибка получения веса с весов')
    }
  }

  // Сохранение
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация
    if (!formData.invoiceNumber.trim()) {
      alert('Введите номер накладной')
      return
    }
    
    if (formData.items.length === 0) {
      alert('Добавьте хотя бы одну позицию')
      return
    }
    
    // Проверяем заполненность позиций
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i]
      if (!item.vehicleNumber || !item.supplier || !item.buyer || !item.material) {
        alert(`Заполните все поля в позиции ${i + 1}`)
        return
      }
    }
    
    const invoiceData: CreateReceiptInvoiceRequest = {
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: formData.invoiceDate,
      warehouse: formData.warehouse,
      seal: formData.seal,
      items: formData.items.map(item => ({
        vehicleNumber: item.vehicleNumber,
        supplier: item.supplier,
        buyer: item.buyer,
        material: item.material,
        bruttoWeight: item.bruttoWeight,
        bruttoDateTime: item.bruttoDateTime,
        taraWeight: item.taraWeight,
        taraDateTime: item.taraDateTime,
        netWeight: item.netWeight,
        humidity: item.humidity,
        finalWeight: item.finalWeight,
        weighingStatus: item.weighingStatus
      })),
      receivedBy: formData.receivedBy,
      issuedBy: formData.receivedBy // Используем того же пользователя
    }
    
    onSave(invoiceData)
    onClose()
  }

  const formatWeight = (weight?: number) => {
    return weight ? `${weight.toFixed(1)} кг` : '—'
  }

  const formatDateTime = (dateTime?: string) => {
    return dateTime ? new Date(dateTime).toLocaleString('ru-RU') : '—'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-mono-100 text-mono-800'
      case 'brutto_done': return 'bg-mono-100 text-black'
      case 'tara_done': return 'bg-mono-100 text-black'
      case 'completed': return 'bg-mono-100 text-black'
      default: return 'bg-mono-100 text-mono-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'brutto_done': return 'Брутто готово'
      case 'tara_done': return 'Готово'
      case 'completed': return 'Завершено'
      default: return 'Неизвестно'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📋 Приходная накладная" size="xl">
      <div className="space-y-6">
        {/* Весы - отдельный блок */}
        {selectedWarehouse && selectedWarehouse.scalesEnabled && (
          <div className="bg-white border border-mono-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-mono-900">⚖️ Весы ({selectedWarehouse.name})</h3>
              
              {/* Кнопка подключения к весам */}
              <button
                type="button"
                onClick={handleWeightRequest}
                className="px-3 py-1 bg-mono-600 text-white text-sm rounded-lg hover:bg-mono-700 flex items-center space-x-1"
                title="Подключиться к весам"
              >
                <Weight className="h-4 w-4" />
                <span>Получить вес</span>
              </button>
            </div>
            
            {/* Текущий вес для тестирования */}
            {currentWeight && (
              <div className="mb-4 p-3 bg-mono-50 border border-mono-200 rounded-lg">
                <p className="text-sm font-medium text-black">Текущий вес для тестирования:</p>
                <p className="text-xl font-bold text-black">{currentWeight.toFixed(1)} кг</p>
              </div>
            )}
            
            <ScalesWidget
              onWeightChange={setCurrentWeight}
              className="border border-mono-200"
              warehouseId={selectedWarehouse?.id}
              warehouseName={selectedWarehouse?.name}
              comPort={selectedWarehouse?.scalesComPort}
              showAdvanced={false}
              autoConnect={false}
            />
          </div>
        )}

        {/* Форма накладной */}
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-mono-700 mb-2">
              Номер накладной *
            </label>
            <input
              type="text"
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              placeholder="ПН-YYYYMMDD-XXX"
            />
          </div>
          
          <div>
            <label htmlFor="invoiceDate" className="block text-sm font-medium text-mono-700 mb-2">
              Дата накладной *
            </label>
            <input
              type="date"
              id="invoiceDate"
              value={formData.invoiceDate}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
            />
          </div>
          
          <div>
            <label htmlFor="warehouse" className="block text-sm font-medium text-mono-700 mb-2">
              Склад *
            </label>
            <select
              id="warehouse"
              value={formData.warehouse}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, warehouse: e.target.value }))
                setSelectedWarehouseId(e.target.value)
              }}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
            >
              <option value="">Выберите склад</option>
              {allWarehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          
        </div>

        {/* Кнопка добавления позиции */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-mono-900">Позиции накладной</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить позицию</span>
          </button>
        </div>

        {/* Список позиций */}
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={item.id} className="bg-mono-50 border border-mono-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-mono-900">Позиция {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.weighingStatus)}`}>
                    {getStatusText(item.weighingStatus)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-mono-600 hover:text-black"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Номер машины */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Номер машины *
                  </label>
                  <input
                    type="text"
                    value={item.vehicleNumber}
                    onChange={(e) => updateItem(index, 'vehicleNumber', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 text-sm"
                    placeholder="Введите номер (например: 01ABC123)"
                    list={`vehicle-list-${index}`}
                  />
                  <datalist id={`vehicle-list-${index}`}>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.licensePlate}>
                        {vehicle.licensePlate} ({vehicle.model})
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Поставщик */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Поставщик *
                  </label>
                  <select
                    value={item.supplier}
                    onChange={(e) => updateItem(index, 'supplier', e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 text-sm"
                  >
                    <option value="">Выберите поставщика</option>
                    {counterparties.filter(cp => cp.type === 'supplier').map((counterparty) => (
                      <option key={counterparty.id} value={counterparty.id}>
                        {counterparty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Покупатель */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Покупатель *
                  </label>
                  <select
                    value={item.buyer}
                    onChange={(e) => updateItem(index, 'buyer', e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 text-sm"
                  >
                    <option value="">Выберите покупателя</option>
                    {counterparties.filter(cp => cp.type === 'client').map((counterparty) => (
                      <option key={counterparty.id} value={counterparty.id}>
                        {counterparty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Материал */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Материал *
                  </label>
                  <select
                    value={item.material}
                    onChange={(e) => updateItem(index, 'material', e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 text-sm"
                  >
                    <option value="">Выберите материал</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name} ({material.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Взвешивание */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* БРУТТО */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    БРУТТО
                  </label>
                  <input
                    type="text"
                    value={formatWeight(item.bruttoWeight)}
                    readOnly
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg bg-mono-50 text-sm mb-2"
                    title={`Отладка: bruttoWeight = ${item.bruttoWeight}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleGetBruttoWeight(index)}
                    className="w-full px-3 py-2 bg-black text-white rounded-lg hover:bg-black text-sm flex items-center justify-center space-x-1"
                    title="Зафиксировать вес БРУТТО"
                  >
                    <Weight className="h-4 w-4" />
                    <span>Получить вес</span>
                  </button>
                  <p className="text-xs text-mono-500 mt-1">
                    {formatDateTime(item.bruttoDateTime)}
                  </p>
                </div>

                {/* ТАРА */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    ТАРА
                  </label>
                  <input
                    type="text"
                    value={formatWeight(item.taraWeight)}
                    readOnly
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg bg-mono-50 text-sm mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleGetTaraWeight(index)}
                    className="w-full px-3 py-2 bg-black text-white rounded-lg hover:bg-mono-800 text-sm flex items-center justify-center space-x-1"
                    title="Зафиксировать вес ТАРА"
                  >
                    <Weight className="h-4 w-4" />
                    <span>Получить вес</span>
                  </button>
                  <p className="text-xs text-mono-500 mt-1">
                    {formatDateTime(item.taraDateTime)}
                  </p>
                </div>

                {/* НЕТТО */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    НЕТТО
                  </label>
                  <input
                    type="text"
                    value={formatWeight(item.netWeight)}
                    readOnly
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg bg-mono-50 text-sm font-medium"
                  />
                </div>

                {/* Влажность */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Влажность (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={item.humidity || ''}
                    onChange={(e) => updateItem(index, 'humidity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500 text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Итоговый вес */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Итоговый вес
                  </label>
                  <input
                    type="text"
                    value={formatWeight(item.finalWeight)}
                    readOnly
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg bg-mono-100 text-sm font-bold text-black"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ответственное лицо */}
        <div>
          <label htmlFor="receivedBy" className="block text-sm font-medium text-mono-700 mb-2">
            Принял *
          </label>
          <input
            type="text"
            id="receivedBy"
            value={formData.receivedBy}
            onChange={(e) => setFormData(prev => ({ ...prev, receivedBy: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
            placeholder="ФИО и должность"
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-mono-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-black rounded-lg transition-colors duration-200"
          >
            Сохранить
          </button>
        </div>
      </form>
      </div>
    </Modal>
  )
}
