import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useDriversStore } from '../stores/driversStore'
import { UserRole } from '../types/auth'
import Modal from '../components/Modal'
import { Plus, User, Phone, Key, UserCheck, Edit, Trash2 } from 'lucide-react'

interface Driver {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  login: string
  phone: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

const mockDrivers: Driver[] = [
  {
    id: '1',
    firstName: 'Алексей',
    lastName: 'Петров',
    login: 'alexey.petrov',
    phone: '+7 777 123 4567',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Михаил',
    lastName: 'Сидоров',
    login: 'mikhail.sidorov',
    phone: '+7 777 234 5678',
    isActive: true,
    createdAt: '2024-01-20T14:30:00Z'
  }
]

export default function DriversPage() {
  const { user } = useAuthStore()
  const { drivers, addDriver, updateDriver, deleteDriver } = useDriversStore()
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    login: '',
    password: '',
    phone: '',
    isActive: true
  })

  // Проверяем доступ
  const canManageDrivers = user?.role === UserRole.ADMIN || user?.role === UserRole.DISPATCHER

  if (!canManageDrivers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-mono-200">
          <div className="p-8 text-center">
            <UserCheck className="h-16 w-16 mx-auto mb-4 text-mono-400" />
            <h2 className="text-2xl font-bold text-mono-900 mb-2">Доступ запрещен</h2>
            <p className="text-mono-600">
              Управление водителями доступно только администраторам и диспетчерам
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleOpenModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver)
      setFormData({
        firstName: driver.firstName,
        lastName: driver.lastName,
        middleName: driver.middleName || '',
        login: driver.login,
        password: '',
        phone: driver.phone,
        isActive: driver.isActive
      })
    } else {
      setEditingDriver(null)
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        login: '',
        password: '',
        phone: '',
        isActive: true
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDriver(null)
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      login: '',
      password: '',
      phone: '',
      isActive: true
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingDriver) {
      // Обновление существующего водителя
      updateDriver(editingDriver.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        login: formData.login,
        phone: formData.phone,
        isActive: formData.isActive
      })
    } else {
      // Создание нового водителя
      addDriver(formData)
    }
    
    handleCloseModal()
  }

  const handleDelete = (driverId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого водителя?')) {
      deleteDriver(driverId)
    }
  }

  const toggleActive = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    if (driver) {
      updateDriver(driverId, { isActive: !driver.isActive })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-mono-900">Водители</h1>
          <p className="text-mono-600 mt-2">
            Управление водителями компании
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-mono-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Добавить водителя
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-mono-200 p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-mono-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">Всего водителей</p>
              <p className="text-2xl font-bold text-mono-900">{drivers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-mono-200 p-6">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">Активных</p>
              <p className="text-2xl font-bold text-mono-900">
                {drivers.filter(d => d.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-mono-200 p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-mono-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">Неактивных</p>
              <p className="text-2xl font-bold text-mono-900">
                {drivers.filter(d => !d.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <div key={driver.id} className={`bg-white rounded-lg shadow-sm border border-mono-200 ${!driver.isActive ? 'opacity-60' : ''}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-mono-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-mono-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-mono-900">
                      {driver.lastName} {driver.firstName} {driver.middleName || ''}
                    </h3>
                    <p className="text-sm text-mono-500">
                      {driver.isActive ? 'Активен' : 'Неактивен'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenModal(driver)}
                    className="p-2 text-mono-600 hover:text-mono-900 hover:bg-mono-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-mono-500" />
                  <span className="text-sm text-mono-600">Логин:</span>
                  <span className="text-sm font-medium">{driver.login}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-mono-500" />
                  <span className="text-sm text-mono-600">Телефон:</span>
                  <span className="text-sm font-medium">{driver.phone}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => toggleActive(driver.id)}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      driver.isActive 
                        ? 'bg-mono-100 text-mono-700 hover:bg-mono-200' 
                        : 'bg-black text-white hover:bg-mono-800'
                    }`}
                  >
                    {driver.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingDriver ? 'Редактировать водителя' : 'Добавить водителя'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Фамилия Имя Отчество *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  placeholder="Фамилия"
                  className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  placeholder="Имя"
                  className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                  placeholder="Отчество"
                  className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="login" className="block text-sm font-medium text-mono-700 mb-2">
              Логин *
            </label>
            <input
              id="login"
              type="text"
              value={formData.login}
              onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
              required
              placeholder="Введите логин"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-mono-700 mb-2">
              Пароль {editingDriver ? '(оставьте пустым, чтобы не менять)' : '*'}
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required={!editingDriver}
              placeholder="Введите пароль"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-mono-700 mb-2">
              Телефон *
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              placeholder="+7 777 123 4567"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-black focus:ring-black border-mono-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-mono-700">
              Активен
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-mono-300 text-mono-700 rounded-lg hover:bg-mono-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-mono-800 transition-colors"
            >
              {editingDriver ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}