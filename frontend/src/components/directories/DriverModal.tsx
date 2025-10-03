import React, { useState, useEffect } from 'react'
import Modal from '../Modal'
import { User, Phone, Key } from 'lucide-react'

interface Driver {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  login: string
  phone: string
  isActive: boolean
  createdAt: string
}

interface DriverModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (driver: Omit<Driver, 'id' | 'createdAt'>) => void
  driver?: Driver | null
}

export default function DriverModal({ isOpen, onClose, onSave, driver }: DriverModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    login: '',
    password: '',
    phone: '',
    isActive: true
  })

  useEffect(() => {
    if (driver) {
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
  }, [driver, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      login: '',
      password: '',
      phone: '',
      isActive: true
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={driver ? 'Редактировать водителя' : 'Добавить водителя'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ФИО в одной строке */}
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
          <label className="block text-sm font-medium text-mono-700 mb-2">
            Логин *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="text"
              value={formData.login}
              onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
              required
              placeholder="Введите логин"
              className="w-full pl-10 pr-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-mono-700 mb-2">
            Пароль {driver ? '(оставьте пустым, чтобы не менять)' : '*'}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required={!driver}
            placeholder="Введите пароль"
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mono-700 mb-2">
            Телефон *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              placeholder="+7 777 123 4567"
              className="w-full pl-10 pr-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
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
            onClick={handleClose}
            className="px-4 py-2 border border-mono-300 text-mono-700 rounded-lg hover:bg-mono-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-mono-800 transition-colors"
          >
            {driver ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
