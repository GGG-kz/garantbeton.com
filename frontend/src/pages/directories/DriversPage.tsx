import { useState } from 'react'
import PageLayout from '../../components/PageLayout'
import Modal from '../../components/Modal'
import DriverModal from '../../components/directories/DriverModal'
import { Driver, CreateDriverRequest } from '../../types/directories'
import { Plus, Search, Users, Phone, Truck, Edit, Trash2, Eye, Key, Shield, AlertTriangle } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const mockDrivers: Driver[] = []

export default function DriversPage() {
  const [drivers, setDrivers] = useLocalStorage<Driver[]>('drivers', mockDrivers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Driver['status']>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null)

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.login.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || driver.status === filterStatus
    return matchesSearch && matchesFilter && driver.isActive
  })

  const getStatusLabel = (status: Driver['status']) => {
    const labels = {
      active: 'Активен',
      inactive: 'Неактивен',
      vacation: 'В отпуске',
      sick: 'На больничном',
    }
    return labels[status]
  }

  const getStatusColor = (status: Driver['status']) => {
    const colors = {
      active: 'bg-mono-100 text-green-800',
      inactive: 'bg-mono-100 text-mono-800',
      vacation: 'bg-mono-100 text-black',
      sick: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('kk-KZ')
  }


  const handleAdd = () => {
    setEditingDriver(null)
    setIsModalOpen(true)
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setIsModalOpen(true)
  }

  const handleView = (driver: Driver) => {
    setViewingDriver(driver)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого водителя?')) {
      setDrivers(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleSave = (data: CreateDriverRequest) => {
    if (editingDriver) {
      setDrivers(prev => prev.map(item => 
        item.id === editingDriver.id 
          ? { ...item, ...data, updatedAt: new Date().toISOString() }
          : item
      ))
    } else {
      const newDriver: Driver = {
        id: Date.now().toString(),
        ...data,
        status: 'active',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setDrivers(prev => [...prev, newDriver])
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingDriver(null)
  }

  return (
    <PageLayout
      title="Водители"
      subtitle="Управление персоналом водителей и их транспортом"
    >
      <div className="space-y-6">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-mono-900">Водители</h2>
              <p className="text-mono-600">Всего: {filteredDrivers.length}</p>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить водителя</span>
          </button>
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
                  placeholder="Поиск по ФИО, номеру удостоверения или телефону..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Фильтр по статусу */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filterStatus === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                }`}
              >
                Все
              </button>
              {['active', 'vacation', 'sick', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as Driver['status'])}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    filterStatus === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                  }`}
                >
                  {getStatusLabel(status as Driver['status'])}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Список водителей */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDrivers.map((driver) => {
            return (
              <div key={driver.id} className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-mono-900">
                        {driver.fullName}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(driver.status)}`}>
                        {getStatusLabel(driver.status)}
                      </span>
                    </div>
                  </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleView(driver)}
                    className="p-1 text-mono-400 hover:text-mono-600 transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(driver)}
                    className="p-1 text-mono-400 hover:text-black transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(driver.id)}
                    className="p-1 text-mono-400 hover:text-mono-600 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                </div>

                <div className="space-y-3">
                  {/* Контактная информация */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {driver.phone && (
                        <div className="flex items-center space-x-2 text-sm text-mono-600">
                          <Phone className="h-4 w-4 text-mono-400" />
                          <span>{driver.phone}</span>
                        </div>
                      )}
                      
                      {driver.login && (
                        <div className="flex items-center space-x-2 text-sm text-mono-600">
                          <Phone className="h-4 w-4 text-mono-400" />
                          <span className="font-mono">{driver.login}</span>
                          <span className="text-xs text-mono-500">(логин)</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Информация о пароле */}
                    <div className="flex items-center space-x-2 text-sm">
                      {driver.hasChangedPassword ? (
                        <div className="flex items-center space-x-1 text-mono-600">
                          <Shield className="h-4 w-4" />
                          <span className="text-xs">Пароль изменен</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs">Нужно изменить пароль</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Временный пароль (только для администраторов) */}
                  <div className="bg-mono-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-mono-400" />
                        <span className="text-sm text-mono-600">Временный пароль:</span>
                      </div>
                      <span className="text-sm font-mono font-medium text-mono-900">
                        {driver.tempPassword}
                      </span>
                    </div>
                    {!driver.hasChangedPassword && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Водитель должен изменить пароль при первом входе
                      </p>
                    )}
                  </div>




                  {/* Закрепленный транспорт */}
                  {driver.vehicleIds.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-mono-700 mb-2">Закрепленный транспорт:</p>
                      <div className="flex flex-wrap gap-1">
                        {driver.vehicleIds.map((vehicleId, index) => (
                          <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-mono-100 text-black rounded">
                            <Truck className="h-3 w-3" />
                            <span>{vehicleId}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {driver.vehicleIds.length === 0 && (
                    <div className="text-center py-2 text-sm text-mono-500 bg-mono-50 rounded">
                      Транспорт не закреплен
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Пустое состояние */}
        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-mono-400" />
            <h3 className="mt-4 text-lg font-medium text-mono-900">
              {searchTerm || filterStatus !== 'all' ? 'Водители не найдены' : 'Нет водителей'}
            </h3>
            <p className="mt-2 text-mono-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Добавьте первого водителя для начала работы'
              }
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно для редактирования */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDriver ? 'Редактировать водителя' : 'Добавить водителя'}
        size="lg"
      >
        <DriverModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          driver={editingDriver}
          title={editingDriver ? 'Редактировать водителя' : 'Добавить водителя'}
        />
      </Modal>

      {/* Модальное окно для просмотра */}
      <Modal
        isOpen={!!viewingDriver}
        onClose={() => setViewingDriver(null)}
        title="Просмотр водителя"
        size="md"
      >
        {viewingDriver && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700">ФИО</label>
                <p className="mt-1 text-sm text-mono-900">{viewingDriver.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-mono-700">Статус</label>
                <p className="mt-1 text-sm text-mono-900">{getStatusLabel(viewingDriver.status)}</p>
              </div>
            </div>
            

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700">Телефон</label>
                <p className="mt-1 text-sm text-mono-900">{viewingDriver.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-mono-700">Логин</label>
                <p className="mt-1 text-sm font-mono text-mono-900">{viewingDriver.login}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700">Статус пароля</label>
                <div className="mt-1 flex items-center space-x-2">
                  {viewingDriver.hasChangedPassword ? (
                    <div className="flex items-center space-x-1 text-mono-600">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Пароль изменен</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Нужно изменить пароль</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Временный пароль */}
            <div className="bg-mono-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-mono-400" />
                  <label className="block text-sm font-medium text-mono-700">Временный пароль</label>
                </div>
                <span className="text-sm font-mono font-medium text-mono-900 bg-white px-2 py-1 rounded border">
                  {viewingDriver.tempPassword}
                </span>
              </div>
              {!viewingDriver.hasChangedPassword && (
                <p className="text-xs text-orange-600">
                  ⚠️ Водитель должен изменить этот пароль на постоянный в своем кабинете при первом входе
                </p>
              )}
              {viewingDriver.hasChangedPassword && (
                <p className="text-xs text-mono-600">
                  ✅ Водитель уже изменил пароль на постоянный
                </p>
              )}
            </div>



            <div className="flex justify-end pt-4 border-t border-mono-200">
              <button
                onClick={() => setViewingDriver(null)}
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
