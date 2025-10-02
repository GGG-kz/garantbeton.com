import { useState, useEffect } from 'react'
import { Vehicle, CreateVehicleRequest, Driver } from '../../types/directories'
import { Car, Truck, User } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface VehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateVehicleRequest) => void
  vehicle?: Vehicle | null
  title: string
}

export default function VehicleModal({ isOpen, onClose, onSave, vehicle, title }: VehicleModalProps) {
  // Получаем список водителей для выпадающего списка
  const [drivers] = useLocalStorage<Driver[]>('drivers', [])
  
  const [formData, setFormData] = useState({
    type: 'concrete_mixer' as 'concrete_mixer' | 'dump_truck',
    model: '',
    licensePlate: '',
    capacity: 0,
    driverId: '',
    isHired: false,
    status: 'available' as 'available' | 'in_use' | 'in_maintenance',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (vehicle) {
      setFormData({
        type: vehicle.type,
        model: vehicle.model,
        licensePlate: vehicle.licensePlate,
        capacity: vehicle.capacity,
        driverId: vehicle.driverId || '',
        isHired: vehicle.isHired,
        status: vehicle.status,
      })
    } else {
      setFormData({
        type: 'concrete_mixer',
        model: '',
        licensePlate: '',
        capacity: 0,
        driverId: '',
        isHired: false,
        status: 'available',
      })
    }
    setErrors({})
  }, [vehicle, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.model.trim()) {
      newErrors.model = 'Модель обязательна'
    }
    
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'Госномер обязателен'
    }
    
    if (formData.capacity <= 0) {
      newErrors.capacity = 'Вместимость должна быть больше 0'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
    onClose()
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-mono-700 mb-2">
              Тип транспорта *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="concrete_mixer">Автобетоносмеситель</option>
              <option value="dump_truck">Самосвал</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-mono-700 mb-2">
              Статус *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="available">Доступен</option>
              <option value="in_use">В работе</option>
              <option value="in_maintenance">На обслуживании</option>
            </select>
          </div>
        </div>

        {/* Модель и госномер */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-mono-700 mb-2">
              Модель *
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.model ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="КАМАЗ-5320"
              />
            </div>
            {errors.model && <p className="mt-1 text-sm text-mono-600">{errors.model}</p>}
          </div>

          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-mono-700 mb-2">
              Госномер *
            </label>
            <input
              type="text"
              id="licensePlate"
              value={formData.licensePlate}
              onChange={(e) => handleChange('licensePlate', e.target.value.toUpperCase())}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.licensePlate ? 'border-red-300' : 'border-mono-300'
              }`}
              placeholder="А123БВ77"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.licensePlate && <p className="mt-1 text-sm text-mono-600">{errors.licensePlate}</p>}
          </div>
        </div>

        {/* Вместимость и год */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-mono-700 mb-2">
              Вместимость *
            </label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="number"
                id="capacity"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.capacity ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="10"
                min="1"
              />
            </div>
            <p className="mt-1 text-xs text-mono-500">
              {formData.type === 'concrete_mixer' ? 'м³' : 'т'}
            </p>
            {errors.capacity && <p className="mt-1 text-sm text-mono-600">{errors.capacity}</p>}
          </div>

        </div>

        {/* Водитель и наемный транспорт */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="driverId" className="block text-sm font-medium text-mono-700 mb-2">
              Водитель
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <select
                id="driverId"
                value={formData.driverId}
                onChange={(e) => handleChange('driverId', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Выберите водителя</option>
                {drivers
                  .filter(driver => driver.isActive)
                  .map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.fullName} ({driver.phone})
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isHired"
                checked={formData.isHired}
                onChange={(e) => handleChange('isHired', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-mono-300 rounded"
              />
              <label htmlFor="isHired" className="ml-2 block text-sm text-mono-900">
                Наемный транспорт
              </label>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-mono-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors duration-200"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}
