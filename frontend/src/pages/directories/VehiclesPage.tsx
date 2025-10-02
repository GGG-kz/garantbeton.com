import { useState, useEffect } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import VehicleModal from '../../components/directories/VehicleModal'
import { Vehicle, CreateVehicleRequest, Driver } from '../../types/directories'
import { Plus, Search, Truck, Edit, Trash2, Eye } from 'lucide-react'
import { vehiclesApi } from '../../api/vehicles'
import { driversApi } from '../../api/drivers'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | Vehicle['type']>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | Vehicle['status']>('all')

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [vehiclesData, driversData] = await Promise.all([
        vehiclesApi.getAll(),
        driversApi.getAll()
      ])
      setVehicles(vehiclesData)
      setDrivers(driversData)
      handleSearch(searchTerm) // Обновляем отфильтрованный список
    } catch (err) {
      setError('Ошибка загрузки данных')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Функция для фильтрации транспортных средств
  const handleSearch = (search: string) => {
    const filtered = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
                           vehicle.licensePlate.toLowerCase().includes(search.toLowerCase())
      const matchesTypeFilter = filterType === 'all' || vehicle.type === filterType
      const matchesStatusFilter = filterStatus === 'all' || vehicle.status === filterStatus
      return matchesSearch && matchesTypeFilter && matchesStatusFilter && vehicle.isActive
    })
    setFilteredVehicles(filtered)
  }

  // Обновляем фильтрацию при изменении данных
  useEffect(() => {
    handleSearch(searchTerm)
  }, [vehicles, filterType, filterStatus])

  const getTypeLabel = (type: Vehicle['type']) => {
    const labels = {
      concrete_mixer: 'Автобетоносмеситель',
      dump_truck: 'Самосвал',
    }
    return labels[type]
  }

  const getTypeColor = (type: Vehicle['type']) => {
    const colors = {
      concrete_mixer: 'bg-blue-100 text-blue-800',
      dump_truck: 'bg-orange-100 text-orange-800',
    }
    return colors[type]
  }

  const getStatusLabel = (status: Vehicle['status']) => {
    const labels = {
      available: 'Доступен',
      in_use: 'В работе',
      in_maintenance: 'На обслуживании',
    }
    return labels[status]
  }

  const getStatusColor = (status: Vehicle['status']) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      in_use: 'bg-blue-100 text-blue-800',
      in_maintenance: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status]
  }

  const getDriverName = (driverId?: string) => {
    if (!driverId) return null
    const driver = drivers.find(d => d.id === driverId)
    return driver ? driver.fullName : 'Неизвестный водитель'
  }


  const handleAdd = () => {
    setEditingVehicle(null)
    setIsModalOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setIsModalOpen(true)
  }

  const handleView = (vehicle: Vehicle) => {
    setViewingVehicle(vehicle)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот транспорт?')) {
      try {
        await vehiclesApi.delete(id)
        setVehicles(prev => prev.filter(item => item.id !== id))
        handleSearch(searchTerm)
      } catch (err) {
        setError('Ошибка удаления транспортного средства')
        console.error('Error deleting vehicle:', err)
      }
    }
  }

  const handleSave = async (data: CreateVehicleRequest) => {
    try {
      if (editingVehicle) {
        const updatedVehicle = await vehiclesApi.update(editingVehicle.id, data)
        setVehicles(prev => prev.map(item =>
          item.id === editingVehicle.id ? updatedVehicle : item
        ))
      } else {
        const newVehicle = await vehiclesApi.create(data)
        setVehicles(prev => [...prev, newVehicle])
      }
      handleSearch(searchTerm)
      setIsModalOpen(false)
    } catch (err) {
      setError('Ошибка сохранения транспортного средства')
      console.error('Error saving vehicle:', err)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingVehicle(null)
  }


  // UI для загрузки и ошибок
  if (loading) {
    return (
      <PageLayout title="Транспорт">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка транспортных средств...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Транспорт">
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
                  onClick={loadData}
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
      title="Транспорт"
      subtitle="Управление автобетоносмесителями и самосвалами"
    >
      <div className="space-y-6">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Truck className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Транспорт</h2>
              <p className="text-gray-600">Всего: {filteredVehicles.length}</p>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить транспорт</span>
          </button>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию, модели или госномеру..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-4">
              {/* Фильтр по типу */}
              <div className="flex space-x-2">
                <span className="text-sm text-gray-600 self-center">Тип:</span>
                <button
                  onClick={() => {
                    setFilterType('all')
                    handleSearch(searchTerm)
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    filterType === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => {
                    setFilterType('concrete_mixer')
                    handleSearch(searchTerm)
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    filterType === 'concrete_mixer'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  АБС
                </button>
                <button
                  onClick={() => {
                    setFilterType('dump_truck')
                    handleSearch(searchTerm)
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    filterType === 'dump_truck'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Самосвалы
                </button>
              </div>

              {/* Фильтр по статусу */}
              <div className="flex space-x-2">
                <span className="text-sm text-gray-600 self-center">Статус:</span>
                <button
                  onClick={() => {
                    setFilterStatus('all')
                    handleSearch(searchTerm)
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    filterStatus === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Все
                </button>
                {['available', 'in_use', 'in_maintenance'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status as Vehicle['status'])
                      handleSearch(searchTerm)
                    }}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                      filterStatus === status
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusLabel(status as Vehicle['status'])}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Список транспорта */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVehicles.map((vehicle) => {
            return (
              <div key={vehicle.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.model} - {vehicle.licensePlate}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(vehicle.type)}`}>
                      {getTypeLabel(vehicle.type)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                      {getStatusLabel(vehicle.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{vehicle.model}</p>
                    <p>Госномер: {vehicle.licensePlate}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mb-4">
                  <button 
                    onClick={() => handleView(vehicle)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Вместимость */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Вместимость</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {vehicle.capacity} {vehicle.type === 'concrete_mixer' ? 'м³' : 'т'}
                    </p>
                  </div>

                  {/* Водитель и наемный статус */}
                  {(vehicle.driverId || vehicle.isHired) && (
                    <div className="space-y-2">
                      {vehicle.driverId && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Закрепленный водитель</p>
                          <p className="text-sm font-medium text-blue-900">{getDriverName(vehicle.driverId)}</p>
                        </div>
                      )}
                      {vehicle.isHired && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm text-orange-600 font-medium">🏢 Наемный транспорт</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>

        {/* Пустое состояние */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'Транспорт не найден' : 'Нет транспорта'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Добавьте первый транспорт для начала работы'
              }
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно для редактирования */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingVehicle ? 'Редактировать транспорт' : 'Добавить транспорт'}
        size="lg"
      >
        <VehicleModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          vehicle={editingVehicle}
          title={editingVehicle ? 'Редактировать транспорт' : 'Добавить транспорт'}
        />
      </Modal>

      {/* Модальное окно для просмотра */}
      <Modal
        isOpen={!!viewingVehicle}
        onClose={() => setViewingVehicle(null)}
        title="Просмотр транспорта"
        size="md"
      >
        {viewingVehicle && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип</label>
                <p className="mt-1 text-sm text-gray-900">{getTypeLabel(viewingVehicle.type)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <p className="mt-1 text-sm text-gray-900">{getStatusLabel(viewingVehicle.status)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Модель</label>
                <p className="mt-1 text-sm text-gray-900">{viewingVehicle.model}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Госномер</label>
                <p className="mt-1 text-sm text-gray-900">{viewingVehicle.licensePlate}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Вместимость</label>
              <p className="mt-1 text-sm text-gray-900">{viewingVehicle.capacity} {viewingVehicle.type === 'concrete_mixer' ? 'м³' : 'т'}</p>
            </div>

            {viewingVehicle.driverId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Закрепленный водитель</label>
                <p className="mt-1 text-sm text-gray-900">{getDriverName(viewingVehicle.driverId)}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Тип владения</label>
              <p className="mt-1 text-sm text-gray-900">
                {viewingVehicle.isHired ? '🏢 Наемный транспорт' : '🏭 Собственный транспорт'}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setViewingVehicle(null)}
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
