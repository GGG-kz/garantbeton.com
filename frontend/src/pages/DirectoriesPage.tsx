import React, { useState, useEffect } from 'react'
import PageLayout from '../components/PageLayout'
import CounterpartyModal from '../components/directories/CounterpartyModal'
import WarehouseModal from '../components/directories/WarehouseModal'
import MaterialModal from '../components/directories/MaterialModal'
import ConcreteGradeModal from '../components/directories/ConcreteGradeModal'
import DriverModal from '../components/directories/DriverModal'
import MobileCard from '../components/directories/MobileCard'
import { useDriversStore } from '../stores/driversStore'
import { Plus, Building2, Users, Package, Truck, User, Database, X, Edit, Trash2 } from 'lucide-react'

interface Counterparty {
  id: string
  name: string
  type: 'client' | 'supplier'
  organizationType: 'legal' | 'individual'
  bin?: string
  iin?: string
  address?: string
  contactPerson?: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Warehouse {
  id: string
  name: string
  address: string
  coordinates?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Material {
  id: string
  name: string
  type: 'cement' | 'sand' | 'gravel' | 'water' | 'additive' | 'other'
  unit: 'kg' | 'm3' | 'ton' | 'liter'
  additionalInfo?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface MaterialConsumption {
  id: string
  materialId: string
  materialName: string
  materialType: string
  consumption: number
  unit: string
}

interface Driver {
  id: string
  fullName: string
  login: string
  phone: string
  isActive: boolean
  createdAt: string
  userId?: string
}

interface ConcreteGrade {
  id: string
  name: string
  description?: string
  materialConsumptions: MaterialConsumption[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function DirectoriesPage() {
  const [activeTab, setActiveTab] = useState<'counterparties' | 'warehouses' | 'materials' | 'concrete-grades' | 'vehicles' | 'drivers'>('counterparties')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCounterparty, setEditingCounterparty] = useState<Counterparty | null>(null)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [editingConcreteGrade, setEditingConcreteGrade] = useState<ConcreteGrade | null>(null)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [concreteGrades, setConcreteGrades] = useState<ConcreteGrade[]>([])
  
  // Используем общее хранилище для водителей
  const { drivers, addDriver, updateDriver, deleteDriver } = useDriversStore()

  const tabs = [
    { id: 'counterparties', label: 'Контрагенты', icon: Building2 },
    { id: 'warehouses', label: 'Склады', icon: Database },
    { id: 'materials', label: 'Материалы', icon: Package },
    { id: 'concrete-grades', label: 'Марки бетона', icon: Package },
    { id: 'vehicles', label: 'Транспорт', icon: Truck },
    { id: 'drivers', label: 'Водители', icon: User }
  ]

  const handleAdd = () => {
    if (activeTab === 'counterparties') {
      setEditingCounterparty(null)
      setIsModalOpen(true)
    } else if (activeTab === 'warehouses') {
      setEditingWarehouse(null)
      setIsModalOpen(true)
    } else if (activeTab === 'materials') {
      setEditingMaterial(null)
      setIsModalOpen(true)
    } else if (activeTab === 'concrete-grades') {
      setEditingConcreteGrade(null)
      setIsModalOpen(true)
    } else if (activeTab === 'drivers') {
      setEditingDriver(null)
      setIsModalOpen(true)
    }
  }

  const handleEdit = (item: Counterparty | Warehouse | Material | ConcreteGrade | Driver) => {
    if (activeTab === 'counterparties') {
      setEditingCounterparty(item as Counterparty)
      setIsModalOpen(true)
    } else if (activeTab === 'warehouses') {
      setEditingWarehouse(item as Warehouse)
      setIsModalOpen(true)
    } else if (activeTab === 'materials') {
      setEditingMaterial(item as Material)
      setIsModalOpen(true)
    } else if (activeTab === 'concrete-grades') {
      setEditingConcreteGrade(item as ConcreteGrade)
      setIsModalOpen(true)
    } else if (activeTab === 'drivers') {
      setEditingDriver(item as Driver)
      setIsModalOpen(true)
    }
  }

  const handleSave = (data: any) => {
    if (activeTab === 'counterparties') {
      if (editingCounterparty) {
        setCounterparties(prev => prev.map(c => 
          c.id === editingCounterparty.id 
            ? { ...c, ...data, updatedAt: new Date().toISOString() }
            : c
        ))
      } else {
        const newCounterparty: Counterparty = {
          ...data,
          id: Date.now().toString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setCounterparties(prev => [...prev, newCounterparty])
      }
    } else if (activeTab === 'warehouses') {
      if (editingWarehouse) {
        setWarehouses(prev => prev.map(w => 
          w.id === editingWarehouse.id 
            ? { ...w, ...data, updatedAt: new Date().toISOString() }
            : w
        ))
      } else {
        const newWarehouse: Warehouse = {
          ...data,
          id: Date.now().toString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setWarehouses(prev => [...prev, newWarehouse])
      }
    } else if (activeTab === 'materials') {
      if (editingMaterial) {
        setMaterials(prev => prev.map(m => 
          m.id === editingMaterial.id 
            ? { ...m, ...data, updatedAt: new Date().toISOString() }
            : m
        ))
      } else {
        const newMaterial: Material = {
          ...data,
          id: Date.now().toString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setMaterials(prev => [...prev, newMaterial])
      }
    } else if (activeTab === 'concrete-grades') {
      if (editingConcreteGrade) {
        setConcreteGrades(prev => prev.map(cg => 
          cg.id === editingConcreteGrade.id 
            ? { ...cg, ...data, updatedAt: new Date().toISOString() }
            : cg
        ))
      } else {
        const newConcreteGrade: ConcreteGrade = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setConcreteGrades(prev => [...prev, newConcreteGrade])
      }
    } else if (activeTab === 'drivers') {
      if (editingDriver) {
        updateDriver(editingDriver.id, data)
      } else {
        addDriver(data)
      }
    }
    setIsModalOpen(false)
    setEditingCounterparty(null)
    setEditingWarehouse(null)
    setEditingMaterial(null)
    setEditingConcreteGrade(null)
    setEditingDriver(null)
  }

  const handleDelete = (id: string) => {
    const itemTypes: Record<string, string> = {
      'counterparties': 'контрагента',
      'warehouses': 'склад',
      'materials': 'материал',
      'concrete-grades': 'марку бетона',
      'vehicles': 'транспорт',
      'drivers': 'водителя'
    }
    const itemType = itemTypes[activeTab] || 'элемент'
    
    if (window.confirm(`Вы уверены, что хотите удалить этот ${itemType}?`)) {
      if (activeTab === 'counterparties') {
        setCounterparties(prev => prev.filter(c => c.id !== id))
      } else if (activeTab === 'warehouses') {
        setWarehouses(prev => prev.filter(w => w.id !== id))
      } else if (activeTab === 'materials') {
        setMaterials(prev => prev.filter(m => m.id !== id))
      } else if (activeTab === 'concrete-grades') {
        setConcreteGrades(prev => prev.filter(cg => cg.id !== id))
      } else if (activeTab === 'drivers') {
        deleteDriver(id)
      }
    }
  }

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'cement': 'Цемент',
      'sand': 'Песок',
      'gravel': 'Щебень',
      'water': 'Вода',
      'additive': 'Химии/Добавки',
      'other': 'Другое'
    }
    return typeLabels[type] || 'Неизвестно'
  }

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'cement': 'bg-mono-100 text-mono-800',
      'sand': 'bg-mono-100 text-mono-800',
      'gravel': 'bg-mono-100 text-mono-800',
      'water': 'bg-mono-100 text-mono-800',
      'additive': 'bg-mono-100 text-mono-800',
      'other': 'bg-mono-100 text-mono-800'
    }
    return typeColors[type] || 'bg-mono-100 text-mono-800'
  }

  const renderCounterparties = () => (
    <div className="space-y-6">
      {/* Заголовок с кнопкой добавления */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-mono-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-mono-900">Контрагенты</h2>
            <p className="text-sm sm:text-base text-mono-600">Всего: {counterparties.length}</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-mono-600 hover:bg-mono-700 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm sm:text-base">Добавить контрагента</span>
        </button>
      </div>

      {/* Список контрагентов */}
      {counterparties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-mono-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mono-900 mb-2">Контрагенты не найдены</h3>
          <p className="text-mono-500">Создайте первого контрагента для начала работы</p>
        </div>
      ) : (
        <div className="space-y-3">
          {counterparties.map((counterparty) => (
            <MobileCard
              key={counterparty.id}
              title={counterparty.name}
              fields={[
                { label: 'Тип', value: counterparty.type === 'client' ? 'Клиент' : 'Поставщик' },
                { label: 'Организация', value: counterparty.organizationType === 'legal' ? 'Юридическое лицо' : 'Физическое лицо' },
                { label: 'ИИН/БИН', value: counterparty.organizationType === 'legal' ? `БИН: ${counterparty.bin}` : `ИИН: ${counterparty.iin}` },
                { label: 'Контактное лицо', value: counterparty.contactPerson || '—' },
                { label: 'Телефон', value: counterparty.phone || '—' }
              ]}
              onEdit={() => handleEdit(counterparty)}
              onDelete={() => handleDelete(counterparty.id)}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderWarehouses = () => (
    <div className="space-y-6">
      {/* Заголовок с кнопкой добавления */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Database className="h-6 w-6 sm:h-8 sm:w-8 text-mono-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-mono-900">Склады</h2>
            <p className="text-sm sm:text-base text-mono-600">Всего: {warehouses.length}</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-mono-600 hover:bg-mono-700 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm sm:text-base">Добавить склад</span>
        </button>
      </div>

      {/* Список складов */}
      {warehouses.length === 0 ? (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-mono-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mono-900 mb-2">Склады не найдены</h3>
          <p className="text-mono-500">Создайте первый склад для начала работы</p>
        </div>
      ) : (
        <div className="space-y-3">
          {warehouses.map((warehouse) => (
            <MobileCard
              key={warehouse.id}
              title={warehouse.name}
              fields={[
                { label: 'Адрес', value: warehouse.address },
                { label: 'Координаты', value: warehouse.coordinates || '—' }
              ]}
              onEdit={() => handleEdit(warehouse)}
              onDelete={() => handleDelete(warehouse.id)}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderMaterials = () => (
    <div className="space-y-6">
      {/* Заголовок с кнопкой добавления */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-mono-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-mono-900">Материалы</h2>
            <p className="text-sm sm:text-base text-mono-600">Всего: {materials.length}</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-mono-600 hover:bg-mono-700 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm sm:text-base">Добавить материал</span>
        </button>
      </div>

      {/* Список материалов */}
      {materials.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-mono-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mono-900 mb-2">Материалы не найдены</h3>
          <p className="text-mono-500">Создайте первый материал для начала работы</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <MobileCard
              key={material.id}
              title={material.name}
              fields={[
                { label: 'Тип', value: getTypeLabel(material.type) },
                { label: 'Единица измерения', value: material.unit === 'kg' ? 'кг' : 
                                                      material.unit === 'm3' ? 'м³' : 
                                                      material.unit === 'ton' ? 'т' : 'л' },
                { label: 'Дополнительная информация', value: material.additionalInfo || '—' }
              ]}
              onEdit={() => handleEdit(material)}
              onDelete={() => handleDelete(material.id)}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderConcreteGrades = () => (
    <div className="space-y-6">
      {/* Заголовок с кнопкой добавления */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-mono-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-mono-900">Марки бетона</h2>
            <p className="text-sm sm:text-base text-mono-600">Всего: {concreteGrades.length}</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-mono-600 hover:bg-mono-700 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm sm:text-base">Добавить марку бетона</span>
        </button>
      </div>

      {/* Список марок бетона */}
      {concreteGrades.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-mono-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mono-900 mb-2">Марки бетона не найдены</h3>
          <p className="text-mono-500">Создайте первую марку бетона для начала работы</p>
        </div>
      ) : (
        <div className="space-y-3">
          {concreteGrades.map((concreteGrade) => (
            <MobileCard
              key={concreteGrade.id}
              title={concreteGrade.name}
              fields={[
                { label: 'Описание', value: concreteGrade.description || '—' },
                { label: 'Материалы', value: concreteGrade.materialConsumptions.length > 0 
                  ? `${concreteGrade.materialConsumptions.length} материалов`
                  : 'Нет материалов' }
              ]}
              onEdit={() => handleEdit(concreteGrade)}
              onDelete={() => handleDelete(concreteGrade.id)}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderDrivers = () => (
    <div className="space-y-6">
      {/* Заголовок с кнопкой добавления */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-mono-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-mono-900">Водители</h2>
            <p className="text-sm sm:text-base text-mono-600">Всего: {drivers.length}</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-mono-600 hover:bg-mono-700 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm sm:text-base">Добавить водителя</span>
        </button>
      </div>

      {/* Список водителей */}
      {drivers.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-mono-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mono-900 mb-2">Водители не найдены</h3>
          <p className="text-mono-500">Создайте первого водителя для начала работы</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver) => (
            <MobileCard
              key={driver.id}
              title={driver.fullName}
              fields={[
                { label: 'Логин', value: driver.login },
                { label: 'Телефон', value: driver.phone },
                { label: 'Статус', value: driver.isActive ? 'Активен' : 'Неактивен' }
              ]}
              onEdit={() => handleEdit(driver)}
              onDelete={() => handleDelete(driver.id)}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderPlaceholder = (title: string, description: string) => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-lg font-medium text-mono-900 mb-2">{title}</h3>
      <p className="text-mono-500">{description}</p>
    </div>
  )

  return (
    <PageLayout
      title="Справочники"
      subtitle="Управление номенклатурой и контрагентами"
    >
      <div className="space-y-6">
        {/* Вкладки */}
        <div className="border-b border-mono-200">
          <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-mono-500 text-mono-600'
                      : 'border-transparent text-mono-500 hover:text-mono-700 hover:border-mono-300'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Содержимое вкладок */}
        <div className="min-h-[400px]">
          {activeTab === 'counterparties' && renderCounterparties()}
          {activeTab === 'warehouses' && renderWarehouses()}
          {activeTab === 'materials' && renderMaterials()}
          {activeTab === 'concrete-grades' && renderConcreteGrades()}
          {activeTab === 'vehicles' && renderPlaceholder('Транспорт', 'Раздел в разработке')}
          {activeTab === 'drivers' && renderDrivers()}
        </div>

        {/* Модальные окна */}
        <CounterpartyModal
          isOpen={isModalOpen && activeTab === 'counterparties'}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCounterparty(null)
          }}
          onSave={handleSave}
          counterparty={editingCounterparty}
        />
        
        <WarehouseModal
          isOpen={isModalOpen && activeTab === 'warehouses'}
          onClose={() => {
            setIsModalOpen(false)
            setEditingWarehouse(null)
          }}
          onSave={handleSave}
          warehouse={editingWarehouse}
        />
        
        <MaterialModal
          isOpen={isModalOpen && activeTab === 'materials'}
          onClose={() => {
            setIsModalOpen(false)
            setEditingMaterial(null)
          }}
          onSave={handleSave}
          material={editingMaterial}
        />
        
        <ConcreteGradeModal
          isOpen={isModalOpen && activeTab === 'concrete-grades'}
          onClose={() => {
            setIsModalOpen(false)
            setEditingConcreteGrade(null)
          }}
          onSave={handleSave}
          concreteGrade={editingConcreteGrade}
          materials={materials}
        />
        
        <DriverModal
          isOpen={isModalOpen && activeTab === 'drivers'}
          onClose={() => {
            setIsModalOpen(false)
            setEditingDriver(null)
          }}
          onSave={handleSave}
          driver={editingDriver}
        />
      </div>
    </PageLayout>
  )
}
