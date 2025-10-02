import { useState, useEffect } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import CounterpartyModal from '../../components/directories/CounterpartyModal'
import ViewToggle from '../../components/ViewToggle'
import { Counterparty, CreateCounterpartyRequest } from '../../types/directories'
import { Plus, Search, Building2, Phone, Mail, MapPin, Edit, Trash2, Eye, User, Crown } from 'lucide-react'
import { counterpartiesApi } from '../../api/counterparties'
import { useAuthStore } from '../../stores/authStore'

export default function CounterpartiesPage() {
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [filteredCounterparties, setFilteredCounterparties] = useState<Counterparty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'supplier' | 'client'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCounterparty, setEditingCounterparty] = useState<Counterparty | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'createdAt'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  // Загрузка контрагентов при монтировании компонента
  useEffect(() => {
    loadCounterparties()
  }, [])

  const loadCounterparties = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await counterpartiesApi.getAll()
      setCounterparties(data)
      handleSearch(searchTerm) // Обновляем отфильтрованный список
    } catch (err) {
      setError('Ошибка загрузки контрагентов')
      console.error('Error loading counterparties:', err)
    } finally {
      setLoading(false)
    }
  }

  // Фильтрация и сортировка
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    let filtered = counterparties.filter(counterparty => 
      counterparty.name.toLowerCase().includes(term.toLowerCase()) ||
      counterparty.fullName?.toLowerCase().includes(term.toLowerCase()) ||
      counterparty.contactPerson?.toLowerCase().includes(term.toLowerCase()) ||
      counterparty.phone?.includes(term) ||
      counterparty.email?.toLowerCase().includes(term.toLowerCase())
    )

    if (selectedType !== 'all') {
      filtered = filtered.filter(counterparty => counterparty.type === selectedType)
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: string
      let bValue: string

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'createdAt':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    setFilteredCounterparties(filtered)
  }

  const handleTypeFilter = (type: 'all' | 'supplier' | 'client') => {
    setSelectedType(type)
    handleSearch(searchTerm)
  }

  const handleSort = (field: 'name' | 'type' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    handleSearch(searchTerm)
  }

  const handleCreate = async (data: CreateCounterpartyRequest) => {
    try {
      const newCounterparty = await counterpartiesApi.create(data)
      setCounterparties(prev => [...prev, newCounterparty])
      handleSearch(searchTerm)
      setIsModalOpen(false)
    } catch (err) {
      setError('Ошибка создания контрагента')
      console.error('Error creating counterparty:', err)
    }
  }

  const handleUpdate = async (data: CreateCounterpartyRequest) => {
    if (!editingCounterparty) return

    try {
      const updatedCounterparty = await counterpartiesApi.update(editingCounterparty.id, data)
      setCounterparties(prev => prev.map(c => c.id === editingCounterparty.id ? updatedCounterparty : c))
      handleSearch(searchTerm)
      setEditingCounterparty(null)
      setIsModalOpen(false)
    } catch (err) {
      setError('Ошибка обновления контрагента')
      console.error('Error updating counterparty:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого контрагента?')) {
      try {
        await counterpartiesApi.delete(id)
        setCounterparties(prev => prev.filter(counterparty => counterparty.id !== id))
        handleSearch(searchTerm)
      } catch (err) {
        setError('Ошибка удаления контрагента')
        console.error('Error deleting counterparty:', err)
      }
    }
  }

  const handleEdit = (counterparty: Counterparty) => {
    setEditingCounterparty(counterparty)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCounterparty(null)
  }

  // Инициализация фильтрации при загрузке данных
  useEffect(() => {
    if (counterparties.length > 0) {
      handleSearch('')
    }
  }, [counterparties])

  const stats = {
    total: counterparties.length,
    suppliers: counterparties.filter(c => c.type === 'supplier').length,
    clients: counterparties.filter(c => c.type === 'client').length,
    active: counterparties.filter(c => c.isActive).length
  }

  if (loading) {
    return (
      <PageLayout title="Контрагенты">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка контрагентов...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Контрагенты">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadCounterparties}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Контрагенты">
      <div className="space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Всего</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Поставщики</p>
                <p className="text-2xl font-bold text-gray-900">{stats.suppliers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Клиенты</p>
                <p className="text-2xl font-bold text-gray-900">{stats.clients}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Активные</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Поиск по названию, контактному лицу, телефону..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 input-field w-full"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTypeFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => handleTypeFilter('supplier')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedType === 'supplier'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Поставщики
                </button>
                <button
                  onClick={() => handleTypeFilter('client')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedType === 'client'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Клиенты
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Добавить контрагента
              </button>
            </div>
          </div>
        </div>

        {/* Список контрагентов */}
        {filteredCounterparties.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedType !== 'all' ? 'Контрагенты не найдены' : 'Контрагенты не добавлены'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedType !== 'all'
                ? 'Попробуйте изменить критерии поиска'
                : 'Добавьте первого контрагента для начала работы'}
            </p>
            {(!searchTerm && selectedType === 'all') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                Добавить контрагента
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        onClick={() => handleSort('name')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        Название {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        onClick={() => handleSort('type')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        Тип {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Контактное лицо
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Телефон
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCounterparties.map((counterparty) => (
                      <tr key={counterparty.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{counterparty.name}</div>
                            {counterparty.fullName && (
                              <div className="text-sm text-gray-500">{counterparty.fullName}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            counterparty.type === 'supplier'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {counterparty.type === 'supplier' ? 'Поставщик' : 'Клиент'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {counterparty.contactPerson || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {counterparty.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {counterparty.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            counterparty.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {counterparty.isActive ? 'Активный' : 'Неактивный'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(counterparty)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(counterparty.id)}
                              className="text-red-600 hover:text-red-900"
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
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCounterparties.map((counterparty) => (
                  <div key={counterparty.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <Building2 className="h-6 w-6 text-blue-600 mr-2" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{counterparty.name}</h3>
                          {counterparty.fullName && (
                            <p className="text-sm text-gray-500">{counterparty.fullName}</p>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        counterparty.type === 'supplier'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {counterparty.type === 'supplier' ? 'Поставщик' : 'Клиент'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {counterparty.contactPerson && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          {counterparty.contactPerson}
                        </div>
                      )}
                      {counterparty.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {counterparty.phone}
                        </div>
                      )}
                      {counterparty.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {counterparty.email}
                        </div>
                      )}
                      {counterparty.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {counterparty.address}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        counterparty.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {counterparty.isActive ? 'Активный' : 'Неактивный'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(counterparty)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(counterparty.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Модальное окно */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={editingCounterparty ? 'Редактировать контрагента' : 'Добавить контрагента'}
        >
          <CounterpartyModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={editingCounterparty ? handleUpdate : handleCreate}
            counterparty={editingCounterparty}
            title={editingCounterparty ? 'Редактировать контрагента' : 'Добавить контрагента'}
          />
        </Modal>
      </div>
    </PageLayout>
  )
}