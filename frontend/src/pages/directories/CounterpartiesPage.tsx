import { useState } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import CounterpartyModal from '../../components/directories/CounterpartyModal'
import ViewToggle from '../../components/ViewToggle'
import { Counterparty, CreateCounterpartyRequest } from '../../types/directories'
import { Plus, Search, Building2, Phone, Mail, MapPin, Edit, Trash2, Eye, User, Crown } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useAuthStore } from '../../stores/authStore'

const mockCounterparties: Counterparty[] = []

export default function CounterpartiesPage() {
  const { user } = useAuthStore()
  const [counterparties, setCounterparties] = useLocalStorage<Counterparty[]>('counterparties', mockCounterparties)
  const [viewMode, setViewMode] = useLocalStorage<'cards' | 'list'>('counterpartiesViewMode', 'list')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'client' | 'supplier'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCounterparty, setEditingCounterparty] = useState<Counterparty | null>(null)
  const [viewingCounterparty, setViewingCounterparty] = useState<Counterparty | null>(null)

  const filteredCounterparties = counterparties.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesFilter && item.isActive
  })

  const getTypeLabel = (type: 'client' | 'supplier') => {
    return type === 'client' ? 'Клиент' : 'Поставщик'
  }

  const getTypeColor = (type: 'client' | 'supplier') => {
    return type === 'client' 
      ? 'bg-mono-100 text-black' 
      : 'bg-mono-100 text-green-800'
  }

  const handleAdd = () => {
    setEditingCounterparty(null)
    setIsModalOpen(true)
  }

  const handleEdit = (counterparty: Counterparty) => {
    setEditingCounterparty(counterparty)
    setIsModalOpen(true)
  }

  const handleView = (counterparty: Counterparty) => {
    setViewingCounterparty(counterparty)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого контрагента?')) {
      setCounterparties(prev => prev.map(item => 
        item.id === id ? { ...item, isActive: false } : item
      ))
    }
  }

  const handleToggleVIP = (counterparty: Counterparty) => {
    const newVIPStatus = !counterparty.autoApprove
    const action = newVIPStatus ? 'назначить VIP' : 'снять VIP статус'
    
    if (window.confirm(`Вы уверены, что хотите ${action} для "${counterparty.name}"?`)) {
      setCounterparties(prev => prev.map(item => 
        item.id === counterparty.id 
          ? { ...item, autoApprove: newVIPStatus, updatedAt: new Date().toISOString() }
          : item
      ))
    }
  }

  const handleSave = (data: CreateCounterpartyRequest) => {
    if (editingCounterparty) {
      // Редактирование существующего
      setCounterparties(prev => prev.map(item => 
        item.id === editingCounterparty.id 
          ? { ...item, ...data, updatedAt: new Date().toISOString() }
          : item
      ))
    } else {
      // Добавление нового
      const newCounterparty: Counterparty = {
        id: Date.now().toString(),
        ...data,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setCounterparties(prev => [...prev, newCounterparty])
    }
    setIsModalOpen(false)
    setEditingCounterparty(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCounterparty(null)
  }

  return (
    <PageLayout
      title="Контрагенты"
      subtitle="Управление клиентами и поставщиками"
    >
      <div className="space-y-6">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-mono-900">Контрагенты</h2>
              <p className="text-mono-600">Всего: {filteredCounterparties.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <button 
              onClick={handleAdd}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Добавить контрагента</span>
            </button>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg border border-mono-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию, ФИО контакта..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Фильтр по типу */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filterType === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setFilterType('client')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filterType === 'client'
                    ? 'bg-mono-500 text-white'
                    : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                }`}
              >
                Клиенты
              </button>
              <button
                onClick={() => setFilterType('supplier')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filterType === 'supplier'
                    ? 'bg-mono-500 text-white'
                    : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                }`}
              >
                Поставщики
              </button>
            </div>
          </div>
        </div>

        {/* Отображение контрагентов */}
        {viewMode === 'list' ? (
          /* Табличный вид */
          <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Тип
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Контактное лицо
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Телефон
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-mono-500 uppercase tracking-wider">
                      VIP
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCounterparties.map((counterparty) => (
                    <tr key={counterparty.id} className="hover:bg-mono-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-mono-900">{counterparty.name}</div>
                        {counterparty.fullName && (
                          <div className="text-sm text-mono-500">{counterparty.fullName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(counterparty.type)}`}>
                          {getTypeLabel(counterparty.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                        {counterparty.contactPerson || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                        {counterparty.phone || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                        {counterparty.email || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {counterparty.autoApprove ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            VIP
                          </span>
                        ) : (
                          <span className="text-mono-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleView(counterparty)}
                            className="text-black hover:text-black"
                            title="Просмотр"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user?.role === 'director' && (
                            <button 
                              onClick={() => handleToggleVIP(counterparty)}
                              className={`transition-colors duration-200 ${
                                counterparty.autoApprove 
                                  ? 'text-mono-600 hover:text-yellow-900' 
                                  : 'text-mono-400 hover:text-mono-600'
                              }`}
                              title={counterparty.autoApprove ? 'Снять VIP статус' : 'Назначить VIP статус'}
                            >
                              <Crown className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(counterparty)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(counterparty.id)}
                            className="text-mono-600 hover:text-red-900"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
            {filteredCounterparties.map((counterparty) => (
              <div key={counterparty.id} className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200 relative">
                {/* Кнопки действий в правом верхнем углу */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button 
                    onClick={() => handleView(counterparty)}
                    className="p-1 text-black hover:text-black rounded hover:bg-mono-50 transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {user?.role === 'director' && (
                    <button 
                      onClick={() => handleToggleVIP(counterparty)}
                      className={`p-1 rounded transition-colors duration-200 ${
                        counterparty.autoApprove 
                          ? 'text-mono-600 hover:text-yellow-900 hover:bg-yellow-50' 
                          : 'text-mono-400 hover:text-mono-600 hover:bg-mono-50'
                      }`}
                      title={counterparty.autoApprove ? 'Снять VIP статус' : 'Назначить VIP статус'}
                    >
                      <Crown className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleEdit(counterparty)}
                    className="p-1 text-indigo-600 hover:text-indigo-900 rounded hover:bg-indigo-50 transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(counterparty.id)}
                    className="p-1 text-mono-600 hover:text-red-900 rounded hover:bg-red-50 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Основная информация */}
                <div className="mb-4 pr-20">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-mono-900 truncate">
                      {counterparty.name}
                    </h3>
                    {counterparty.autoApprove && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        <Crown className="h-3 w-3 mr-1" />
                        VIP
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getTypeColor(counterparty.type)}`}>
                    {getTypeLabel(counterparty.type)}
                  </span>
                </div>

                <div className="space-y-3">
                  {counterparty.contactPerson && (
                    <div className="flex items-center text-sm text-mono-600">
                      <User className="h-4 w-4 text-mono-400 mr-2" />
                      <span>{counterparty.contactPerson}</span>
                    </div>
                  )}
                  
                  {counterparty.phone && (
                    <div className="flex items-center text-sm text-mono-600">
                      <Phone className="h-4 w-4 text-mono-400 mr-2" />
                      <span>{counterparty.phone}</span>
                    </div>
                  )}
                  
                  {counterparty.email && (
                    <div className="flex items-center text-sm text-mono-600">
                      <Mail className="h-4 w-4 text-mono-400 mr-2" />
                      <span>{counterparty.email}</span>
                    </div>
                  )}
                  
                  {counterparty.address && (
                    <div className="flex items-center text-sm text-mono-600">
                      <MapPin className="h-4 w-4 text-mono-400 mr-2" />
                      <span>{counterparty.address}</span>
                    </div>
                  )}
                </div>

                {counterparty.notes && (
                  <div className="mt-4 pt-3 border-t border-mono-200">
                    <p className="text-sm text-mono-600">
                      <strong>Примечания:</strong> {counterparty.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Пустое состояние */}
        {filteredCounterparties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-mono-400" />
            <h3 className="mt-4 text-lg font-medium text-mono-900">
              {searchTerm || filterType !== 'all' ? 'Контрагенты не найдены' : 'Нет контрагентов'}
            </h3>
            <p className="mt-2 text-mono-600">
              {searchTerm || filterType !== 'all' 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Добавьте первого контрагента для начала работы'
              }
            </p>
          </div>
        )}

        {/* Модальное окно для редактирования */}
        <CounterpartyModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingCounterparty ? 'Редактировать контрагента' : 'Добавить контрагента'}
          counterparty={editingCounterparty}
          onSave={handleSave}
        />

        {/* Модальное окно для просмотра */}
        {viewingCounterparty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-mono-900">
                    {viewingCounterparty.name}
                  </h3>
                  <button
                    onClick={() => setViewingCounterparty(null)}
                    className="text-mono-400 hover:text-mono-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700">Полное название</label>
                    <p className="mt-1 text-sm text-mono-900">{viewingCounterparty.fullName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mono-700">Тип</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(viewingCounterparty.type)}`}>
                      {getTypeLabel(viewingCounterparty.type)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mono-700">Контактное лицо</label>
                    <p className="mt-1 text-sm text-mono-900">{viewingCounterparty.contactPerson || '—'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mono-700">Телефон</label>
                    <p className="mt-1 text-sm text-mono-900">{viewingCounterparty.phone || '—'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mono-700">Email</label>
                    <p className="mt-1 text-sm text-mono-900">{viewingCounterparty.email || '—'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mono-700">Адрес</label>
                    <p className="mt-1 text-sm text-mono-900">{viewingCounterparty.address || '—'}</p>
                  </div>

                  {viewingCounterparty.notes && (
                    <div>
                      <label className="block text-sm font-medium text-mono-700">Примечания</label>
                      <p className="mt-1 text-sm text-mono-900">{viewingCounterparty.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setViewingCounterparty(null)}
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