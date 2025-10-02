import { useState, useEffect } from 'react'
import { Warehouse, CreateWarehouseRequest } from '../../types/directories'
import { Building, MapPin, Phone, Map } from 'lucide-react'

interface WarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateWarehouseRequest) => void
  warehouse?: Warehouse | null
  title: string
}

export default function WarehouseModal({ isOpen, onClose, onSave, warehouse, title }: WarehouseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    materials: [] as string[],
    coordinates: '',
    scalesComPort: '',
    scalesModel: '',
    scalesEnabled: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        address: warehouse.address,
        phone: warehouse.phone || '',
        materials: warehouse.materials || [],
        coordinates: warehouse.coordinates || '',
        scalesComPort: warehouse.scalesComPort || '',
        scalesModel: warehouse.scalesModel || '',
        scalesEnabled: warehouse.scalesEnabled || false,
      })
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        materials: [],
        coordinates: '',
        scalesComPort: '',
        scalesModel: '',
        scalesEnabled: false,
      })
    }
    setErrors({})
  }, [warehouse, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно'
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
    onClose()
  }

  const handleChange = (field: string, value: string | number | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-mono-700 mb-2">
            Название склада *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.name ? 'border-red-300' : 'border-mono-300'
              }`}
              placeholder="Основной склад"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-mono-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-mono-700 mb-2">
            Адрес *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.address ? 'border-red-300' : 'border-mono-300'
              }`}
              placeholder="г. Астана, ул. Промышленная, 15"
            />
          </div>
          {errors.address && <p className="mt-1 text-sm text-mono-600">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-mono-700 mb-2">
            Телефон *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="text"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.phone ? 'border-red-300' : 'border-mono-300'
              }`}
              placeholder="+7 (7172) 123-45-67"
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-mono-600">{errors.phone}</p>}
        </div>


        {/* Кнопки */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-mono-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}
