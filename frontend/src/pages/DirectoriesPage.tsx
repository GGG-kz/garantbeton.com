import React, { useState } from 'react'
import PageLayout from '../components/PageLayout'
import CounterpartyModal from '../components/directories/CounterpartyModal'
import { Plus, Building2, Users, Package, Truck, User, Database, X } from 'lucide-react'

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

export default function DirectoriesPage() {
  const [activeTab, setActiveTab] = useState<'counterparties' | 'warehouses' | 'materials' | 'concrete-grades' | 'vehicles' | 'drivers'>('counterparties')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCounterparty, setEditingCounterparty] = useState<Counterparty | null>(null)
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])

  const tabs = [
    { id: 'counterparties', label: 'Контрагенты', icon: Building2 },
    { id: 'warehouses', label: 'Склады', icon: Database },
    { id: 'materials', label: 'Материалы', icon: Package },
    { id: 'concrete-grades', label: 'Марки бетона', icon: Package },
    { id: 'vehicles', label: 'Транспорт', icon: Truck },
    { id: 'drivers', label: 'Водители', icon: User }
  ]

  const handleAdd = () => {
    setEditingCounterparty(null)
    setIsModalOpen(true)
  }

  const handleEdit = (counterparty: Counterparty) => {
    setEditingCounterparty(counterparty)
    setIsModalOpen(true)
  }

  const handleSave = (data: Omit<Counterparty, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCounterparty) {
      // Редактирование
      setCounterparties(prev => prev.map(c => 
        c.id === editingCounterparty.id 
          ? { ...c, ...data, updatedAt: new Date().toISOString() }
          : c
      ))
    } else {
      // Создание
      const newCounterparty: Counterparty = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCounterparties(prev => [...prev, newCounterparty])
    }
    setIsModalOpen(false)
    setEditingCounterparty(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого контрагента?')) {
      setCounterparties(prev => prev.filter(c => c.id !== id))
    }
  }

  const renderCounterparties = () => (
    <div className="space-y-6">
      {/* Заголовок с кнопкой добавления */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-mono-600" />
          <div>
            <h2 className="text-2xl font-bold text-mono-900">Контрагенты</h2>
            <p className="text-mono-600">Всего: {counterparties.length}</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-mono-600 hover:bg-mono-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить контрагента</span>
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
        <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-mono-200">
              <thead className="bg-mono-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Наименование
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Организация
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Контактное лицо
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Телефон
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-mono-200">
                {counterparties.map((counterparty) => (
                  <tr key={counterparty.id} className="hover:bg-mono-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-mono-900">{counterparty.name}</div>
                      <div className="text-sm text-mono-500">
                        {counterparty.organizationType === 'legal' ? `БИН: ${counterparty.bin}` : `ИИН: ${counterparty.iin}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        counterparty.type === 'client' 
                          ? 'bg-mono-100 text-mono-800' 
                          : 'bg-mono-100 text-mono-800'
                      }`}>
                        {counterparty.type === 'client' ? 'Клиент' : 'Поставщик'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                      {counterparty.organizationType === 'legal' ? 'Юридическое лицо' : 'Физическое лицо'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                      {counterparty.contactPerson}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                      {counterparty.phone || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(counterparty)}
                          className="text-mono-600 hover:text-black"
                          title="Редактировать"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(counterparty.id)}
                          className="text-mono-600 hover:text-black"
                          title="Удалить"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-mono-500 text-mono-600'
                      : 'border-transparent text-mono-500 hover:text-mono-700 hover:border-mono-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Содержимое вкладок */}
        <div className="min-h-[400px]">
          {activeTab === 'counterparties' && renderCounterparties()}
          {activeTab === 'warehouses' && renderPlaceholder('Склады', 'Раздел в разработке')}
          {activeTab === 'materials' && renderPlaceholder('Материалы', 'Раздел в разработке')}
          {activeTab === 'concrete-grades' && renderPlaceholder('Марки бетона', 'Раздел в разработке')}
          {activeTab === 'vehicles' && renderPlaceholder('Транспорт', 'Раздел в разработке')}
          {activeTab === 'drivers' && renderPlaceholder('Водители', 'Раздел в разработке')}
        </div>

        {/* Модальное окно для контрагентов */}
        <CounterpartyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCounterparty(null)
          }}
          onSave={handleSave}
          counterparty={editingCounterparty}
        />
      </div>
    </PageLayout>
  )
}
