import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Price, CreatePriceRequest, Counterparty, ConcreteGrade, Material } from '../types/directories'
import { useLocalStorage } from '../hooks/useLocalStorage'
import PageLayout from '../components/PageLayout'
import Modal from '../components/Modal'
// import PriceModal from '../components/directories/PriceModal'
import { Plus, Search, DollarSign, Building, Package, Edit, Trash2, Eye, Calendar } from 'lucide-react'

// Пустой массив - данные теперь хранятся только в localStorage
const emptyPrices: Price[] = []

export default function PricesPage() {
  const { user } = useAuthStore()
  const [prices, setPrices] = useLocalStorage<Price[]>('prices', emptyPrices)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'concrete' | 'material'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPrice, setEditingPrice] = useState<Price | null>(null)
  const [viewingPrice, setViewingPrice] = useState<Price | null>(null)

  // Проверяем доступ к странице
  const allowedRoles = ['accountant', 'director', 'supply', 'developer']
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-mono-900 mb-4">Доступ запрещен</h1>
          <p className="text-mono-600">Эта страница доступна только бухгалтерам, директорам и снабженцам</p>
        </div>
      </div>
    )
  }

  const filteredPrices = prices.filter(price => {
    const matchesSearch = 
      (price.counterpartyName && price.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (price.concreteGradeName && price.concreteGradeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (price.materialName && price.materialName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'concrete' && price.concreteGradeId) ||
      (filterType === 'material' && price.materialId)
    
    return matchesSearch && matchesFilter && price.isActive
  })

  const handleAdd = () => {
    setEditingPrice(null)
    setIsModalOpen(true)
  }

  const handleEdit = (price: Price) => {
    setEditingPrice(price)
    setIsModalOpen(true)
  }

  const handleView = (price: Price) => {
    setViewingPrice(price)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту цену?')) {
      setPrices(prev => prev.filter(price => price.id !== id))
    }
  }

  const handleSave = (data: CreatePriceRequest) => {
    if (editingPrice) {
      setPrices(prev => prev.map(price => 
        price.id === editingPrice.id 
          ? { 
              ...price, 
              ...data, 
              counterpartyName: data.counterpartyId ? getCounterpartyName(data.counterpartyId) : undefined,
              concreteGradeName: data.concreteGradeId ? getConcreteGradeName(data.concreteGradeId) : undefined,
              materialName: data.materialId ? getMaterialName(data.materialId) : undefined,
              updatedAt: new Date().toISOString() 
            }
          : price
      ))
    } else {
      const newPrice: Price = {
        id: Date.now().toString(),
        ...data,
        counterpartyName: data.counterpartyId ? getCounterpartyName(data.counterpartyId) : undefined,
        concreteGradeName: data.concreteGradeId ? getConcreteGradeName(data.concreteGradeId) : undefined,
        materialName: data.materialId ? getMaterialName(data.materialId) : undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setPrices(prev => [...prev, newPrice])
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPrice(null)
  }

  // Функции для получения названий по ID
  const [counterparties] = useLocalStorage<Counterparty[]>('counterparties', [])
  const [concreteGrades] = useLocalStorage<ConcreteGrade[]>('concreteGrades', [])
  const [materials] = useLocalStorage<Material[]>('materials', [])

  const getCounterpartyName = (id: string) => {
    const cp = counterparties.find(c => c.id === id)
    return cp ? cp.name : 'Неизвестный контрагент'
  }

  const getConcreteGradeName = (id: string) => {
    const grade = concreteGrades.find(g => g.id === id)
    return grade ? `${grade.grade} - ${grade.name}` : 'Неизвестная марка'
  }

  const getMaterialName = (id: string) => {
    const material = materials.find(m => m.id === id)
    return material ? `${material.name} (${material.type}, ${material.unit})` : 'Неизвестный материал'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('kk-KZ')
  }

  const isPriceValid = (price: Price) => {
    const now = new Date()
    const validFrom = new Date(price.validFrom)
    const validTo = price.validTo ? new Date(price.validTo) : null
    
    return validFrom <= now && (!validTo || validTo >= now)
  }

  return (
    <PageLayout
      title="Управление ценами"
      subtitle="Установка и редактирование цен для контрагентов"
    >
      {/* Фильтры и поиск */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                placeholder="Поиск по контрагенту, марке бетона или материалу..."
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
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                filterType === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilterType('concrete')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                filterType === 'concrete'
                  ? 'bg-primary-500 text-white'
                  : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
              }`}
            >
              Бетон
            </button>
            <button
              onClick={() => setFilterType('material')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                filterType === 'material'
                  ? 'bg-primary-500 text-white'
                  : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
              }`}
            >
              Материалы
            </button>
          </div>
        </div>
      </div>

      {/* Кнопка добавления */}
      <div className="mb-6">
        <button
          onClick={handleAdd}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить цену</span>
        </button>
      </div>

      {/* Таблица цен */}
      <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-mono-50 border-b border-mono-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Контрагент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Продукт
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Цена
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Период действия
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.map((price) => (
                <tr key={price.id} className="hover:bg-mono-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-mono-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-mono-900">{price.counterpartyName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-mono-400 mr-2" />
                      <div>
                        <div className="text-sm text-mono-900">
                          {price.concreteGradeName || price.materialName}
                        </div>
                        <div className="text-xs text-mono-500">
                          {price.concreteGradeName ? 'Марка бетона' : 'Материал'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-mono-400 mr-2" />
                      <span className="text-sm font-medium text-mono-900">
                        {formatPrice(price.price)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-mono-400 mr-2" />
                      <div>
                        <div className="text-sm text-mono-900">
                          с {formatDate(price.validFrom)}
                        </div>
                        {price.validTo && (
                          <div className="text-xs text-mono-500">
                            по {formatDate(price.validTo)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      isPriceValid(price)
                        ? 'bg-mono-100 text-black'
                        : 'bg-mono-100 text-black'
                    }`}>
                      {isPriceValid(price) ? 'Действует' : 'Истекла'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(price)}
                        className="text-black hover:text-black p-1 rounded transition-colors duration-200"
                        title="Просмотр"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(price)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors duration-200"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(price.id)}
                        className="text-mono-600 hover:text-black p-1 rounded transition-colors duration-200"
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

        {filteredPrices.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-mono-400" />
            <h3 className="mt-2 text-sm font-medium text-mono-900">Цены не найдены</h3>
            <p className="mt-1 text-sm text-mono-500">
              {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Начните с добавления первой цены'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Добавить цену</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно для редактирования/добавления */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPrice ? 'Редактировать цену' : 'Добавить цену'}
        size="lg"
      >
        <div className="p-6 text-center">
          <p className="text-gray-500">Форма цен временно недоступна</p>
          <p className="text-sm text-gray-400 mt-2">Будет восстановлена завтра</p>
        </div>
      </Modal>

      {/* Модальное окно для просмотра */}
      <Modal
        isOpen={!!viewingPrice}
        onClose={() => setViewingPrice(null)}
        title="Информация о цене"
        size="md"
      >
        {viewingPrice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700">Контрагент</label>
                <p className="mt-1 text-sm text-mono-900">{viewingPrice.counterpartyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-mono-700">Тип продукта</label>
                <p className="mt-1 text-sm text-mono-900">
                  {viewingPrice.concreteGradeName ? 'Марка бетона' : 'Материал'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mono-700">Продукт</label>
              <p className="mt-1 text-sm text-mono-900">
                {viewingPrice.concreteGradeName || viewingPrice.materialName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mono-700">Цена</label>
              <p className="mt-1 text-sm text-mono-900">{formatPrice(viewingPrice.price)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700">Начало действия</label>
                <p className="mt-1 text-sm text-mono-900">{formatDate(viewingPrice.validFrom)}</p>
              </div>
              {viewingPrice.validTo && (
                <div>
                  <label className="block text-sm font-medium text-mono-700">Окончание действия</label>
                  <p className="mt-1 text-sm text-mono-900">{formatDate(viewingPrice.validTo)}</p>
                </div>
              )}
            </div>

            {viewingPrice.notes && (
              <div>
                <label className="block text-sm font-medium text-mono-700">Примечания</label>
                <p className="mt-1 text-sm text-mono-900">{viewingPrice.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-mono-200">
              <button
                onClick={() => setViewingPrice(null)}
                className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
