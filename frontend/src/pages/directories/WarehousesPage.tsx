import { useState, useEffect } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import WarehouseModal from '../../components/directories/WarehouseModal'
import { Warehouse, CreateWarehouseRequest } from '../../types/directories'
import { Plus, Search, Warehouse as WarehouseIcon, MapPin, Phone, Package, Edit, Trash2, Eye, Map } from 'lucide-react'
import { warehousesApi } from '../../api/warehouses'

// Заглушка данных
// Пустой массив для чистого тестирования
const mockWarehouses: Warehouse[] = []

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [viewingWarehouse, setViewingWarehouse] = useState<Warehouse | null>(null)

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadWarehouses()
  }, [])

  const loadWarehouses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await warehousesApi.getAll()
      setWarehouses(data)
    } catch (err) {
      setError('Ошибка загрузки складов')
      console.error('Error loading warehouses:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingWarehouse(null)
    setIsModalOpen(true)
  }

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setIsModalOpen(true)
  }

  const handleView = (warehouse: Warehouse) => {
    setViewingWarehouse(warehouse)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот склад?')) {
      try {
        await warehousesApi.delete(id)
        setWarehouses(prev => prev.filter(item => item.id !== id))
      } catch (err) {
        setError('Ошибка удаления склада')
        console.error('Error deleting warehouse:', err)
      }
    }
  }

  const handleSave = async (data: CreateWarehouseRequest) => {
    try {
      if (editingWarehouse) {
        // Редактирование существующего
        const updatedWarehouse = await warehousesApi.update(editingWarehouse.id, data)
        setWarehouses(prev => prev.map(item =>
          item.id === editingWarehouse.id ? updatedWarehouse : item
        ))
      } else {
        // Добавление нового
        const newWarehouse = await warehousesApi.create({
          ...data,
          isActive: true
        })
        setWarehouses(prev => [...prev, newWarehouse])
      }
      setIsModalOpen(false)
      setEditingWarehouse(null)
    } catch (err) {
      setError('Ошибка сохранения склада')
      console.error('Error saving warehouse:', err)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingWarehouse(null)
  }

  // UI для загрузки и ошибок
  if (loading) {
    return (
      <PageLayout title="Склады">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка складов...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Склады">
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
                  onClick={loadWarehouses}
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
    <PageLayout
      title="Склады"
      subtitle="Управление складскими помещениями и запасами"
    >
      <div className="space-y-6">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <WarehouseIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Склады</h2>
              <p className="text-gray-600">Всего: {filteredWarehouses.length}</p>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить склад</span>
          </button>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию или адресу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего складов</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.length}
                </p>
              </div>
              <WarehouseIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активных складов</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.filter(w => w.isActive).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Список складов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {warehouse.name}
                  </h3>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Активный
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleView(warehouse)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(warehouse)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(warehouse.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Адрес */}
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span>{warehouse.address}</span>
                </div>

                {/* Координаты */}
                {warehouse.coordinates && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Map className="h-4 w-4 text-gray-400" />
                    <span>Координаты: {warehouse.coordinates}</span>
                  </div>
                )}

                {/* Телефон */}
                {warehouse.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{warehouse.phone}</span>
                  </div>
                )}

                {/* Материалы на складе */}
                {warehouse.materials && warehouse.materials.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Хранимые материалы:</p>
                    <div className="flex flex-wrap gap-1">
                      {warehouse.materials.map((materialId, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {materialId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Пустое состояние */}
        {filteredWarehouses.length === 0 && (
          <div className="text-center py-12">
            <WarehouseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm ? 'Склады не найдены' : 'Нет складов'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchTerm 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Добавьте первый склад для начала работы'
              }
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно для редактирования */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWarehouse ? 'Редактировать склад' : 'Добавить склад'}
        size="lg"
      >
        <WarehouseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          warehouse={editingWarehouse}
          title={editingWarehouse ? 'Редактировать склад' : 'Добавить склад'}
        />
      </Modal>

      {/* Модальное окно для просмотра */}
      <Modal
        isOpen={!!viewingWarehouse}
        onClose={() => setViewingWarehouse(null)}
        title="Просмотр склада"
        size="md"
      >
        {viewingWarehouse && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <p className="mt-1 text-sm text-gray-900">{viewingWarehouse.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Адрес</label>
                <p className="mt-1 text-sm text-gray-900">{viewingWarehouse.address}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Координаты</label>
                <p className="mt-1 text-sm text-gray-900">{viewingWarehouse.coordinates || 'Не указаны'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Телефон</label>
                <p className="mt-1 text-sm text-gray-900">{viewingWarehouse.phone || 'Не указан'}</p>
              </div>
            </div>

            {/* Материалы на складе */}
            {viewingWarehouse.materials && viewingWarehouse.materials.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Хранимые материалы</label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {viewingWarehouse.materials.map((materialId, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {materialId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setViewingWarehouse(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
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
