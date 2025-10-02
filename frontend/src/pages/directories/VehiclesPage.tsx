import { useState } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import VehicleModal from '../../components/directories/VehicleModal'
import { Vehicle, CreateVehicleRequest, Driver } from '../../types/directories'
import { Plus, Search, Truck, Edit, Trash2, Eye } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const mockVehicles: Vehicle[] = []

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('vehicles', mockVehicles)
  const [drivers] = useLocalStorage<Driver[]>('drivers', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | Vehicle['type']>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | Vehicle['status']>('all')

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTypeFilter = filterType === 'all' || vehicle.type === filterType
    const matchesStatusFilter = filterStatus === 'all' || vehicle.status === filterStatus
    return matchesSearch && matchesTypeFilter && matchesStatusFilter && vehicle.isActive
  })

  const getTypeLabel = (type: Vehicle['type']) => {
    const labels = {
      concrete_mixer: 'Автобетоносмеситель',
      dump_truck: 'Самосвал',
    }
    return labels[type]
  }

  const getTypeColor = (type: Vehicle['type']) => {
    const colors = {
      concrete_mixer: 'bg-mono-100 text-black',
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
      available: 'bg-mono-100 text-green-800',
      in_use: 'bg-mono-100 text-black',
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

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот транспорт?')) {
      setVehicles(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleSave = (data: CreateVehicleRequest) => {
    if (editingVehicle) {
      setVehicles(prev => prev.map(item => 
        item.id === editingVehicle.id 
          ? { ...item, ...data, updatedAt: new Date().toISOString() }
          : item
      ))
    } else {
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        ...data,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setVehicles(prev => [...prev, newVehicle])
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingVehicle(null)
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
              <h2 className="text-2xl font-bold text-mono-900">Транспорт</h2>
              <p className="text-mono-600">Всего: {filteredVehicles.length}</p>
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
        <div className="bg-white rounded-lg border border-mono-200 p-4">
          <div className="flex flex-col gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию, модели или госномеру..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-4">
              {/* Фильтр по типу */}
              <div className="flex space-x-2">
                <span className="text-sm text-mono-600 self-center">Тип:</span>
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    filterType === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setFilterType('concrete_mixer')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    filterType === 'concrete_mixer'
                      ? 'bg-primary-500 text-white'
                      : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                  }`}
                >
                  АБС
                </button>
                <button
                  onClick={() => setFilterType('dump_truck')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    filterType === 'dump_truck'
                      ? 'bg-primary-500 text-white'
                      : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                  }`}
                >
                  Самосвалы
                </button>
              </div>

              {/* Фильтр по статусу */}
              <div className="flex space-x-2">
                <span className="text-sm text-mono-600 self-center">Статус:</span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    filterStatus === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                  }`}
                >
                  Все
                </button>
                {['active', 'maintenance', 'repair', 'inactive'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as Vehicle['status'])}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                      filterStatus === status
                        ? 'bg-primary-500 text-white'
                        : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
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
              <div key={vehicle.id} className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-mono-900">
                      {vehicle.model} - {vehicle.licensePlate}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(vehicle.type)}`}>
                      {getTypeLabel(vehicle.type)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                      {getStatusLabel(vehicle.status)}
                    </span>
                  </div>
                  <div className="text-sm text-mono-600">
                    <p className="font-medium">{vehicle.model}</p>
                    <p>Госномер: {vehicle.licensePlate}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mb-4">
                  <button 
                    onClick={() => handleView(vehicle)}
                    className="p-2 text-mono-400 hover:text-mono-600 hover:bg-mono-100 rounded-lg transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 text-mono-400 hover:text-black hover:bg-mono-50 rounded-lg transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2 text-mono-400 hover:text-mono-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Вместимость */}
                  <div className="bg-mono-50 p-3 rounded-lg">
                    <p className="text-sm text-mono-600 mb-1">Вместимость</p>
                    <p className="text-lg font-semibold text-mono-900">
                      {vehicle.capacity} {vehicle.type === 'concrete_mixer' ? 'м³' : 'т'}
                    </p>
                  </div>

                  {/* Водитель и наемный статус */}
                  {(vehicle.driverId || vehicle.isHired) && (
                    <div className="space-y-2">
                      {vehicle.driverId && (
                        <div className="bg-mono-50 p-3 rounded-lg">
                          <p className="text-sm text-mono-600 mb-1">Закрепленный водитель</p>
                          <p className="text-sm font-medium text-black">{getDriverName(vehicle.driverId)}</p>
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
            <Truck className="mx-auto h-12 w-12 text-mono-400" />
            <h3 className="mt-4 text-lg font-medium text-mono-900">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'Транспорт не найден' : 'Нет транспорта'}
            </h3>
            <p className="mt-2 text-mono-600">
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
                <label className="block text-sm font-medium text-mono-700">Тип</label>
                <p className="mt-1 text-sm text-mono-900">{getTypeLabel(viewingVehicle.type)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-mono-700">Статус</label>
                <p className="mt-1 text-sm text-mono-900">{getStatusLabel(viewingVehicle.status)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700">Модель</label>
                <p className="mt-1 text-sm text-mono-900">{viewingVehicle.model}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-mono-700">Госномер</label>
                <p className="mt-1 text-sm text-mono-900">{viewingVehicle.licensePlate}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mono-700">Вместимость</label>
              <p className="mt-1 text-sm text-mono-900">{viewingVehicle.capacity} {viewingVehicle.type === 'concrete_mixer' ? 'м³' : 'т'}</p>
            </div>

            {viewingVehicle.driverId && (
              <div>
                <label className="block text-sm font-medium text-mono-700">Закрепленный водитель</label>
                <p className="mt-1 text-sm text-mono-900">{getDriverName(viewingVehicle.driverId)}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-mono-700">Тип владения</label>
              <p className="mt-1 text-sm text-mono-900">
                {viewingVehicle.isHired ? '🏢 Наемный транспорт' : '🏭 Собственный транспорт'}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-mono-200">
              <button
                onClick={() => setViewingVehicle(null)}
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
