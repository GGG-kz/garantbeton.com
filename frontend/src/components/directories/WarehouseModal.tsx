import React, { useState, useEffect } from 'react'
import { X, MapPin, Navigation, Copy } from 'lucide-react'

interface Warehouse {
  id: string
  name: string
  address: string
  coordinates?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface WarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => void
  warehouse?: Warehouse | null
}

export default function WarehouseModal({ isOpen, onClose, onSave, warehouse }: WarehouseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    coordinates: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        address: warehouse.address,
        coordinates: warehouse.coordinates || ''
      })
    } else {
      setFormData({
        name: '',
        address: '',
        coordinates: ''
      })
    }
    setErrors({})
  }, [warehouse, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Наименование склада обязательно'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен'
    }

    if (formData.coordinates && !/^[\d.,\s-]+$/.test(formData.coordinates)) {
      newErrors.coordinates = 'Неверный формат координат. Используйте формат: 43.2220, 76.8512'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSave({
      ...formData,
      isActive: true
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePasteCoordinates = async () => {
    try {
      const text = await navigator.clipboard.readText()
      // Проверяем, что это похоже на координаты
      if (/^[\d.,\s-]+$/.test(text.trim())) {
        setFormData(prev => ({ ...prev, coordinates: text.trim() }))
        if (errors.coordinates) {
          setErrors(prev => ({ ...prev, coordinates: '' }))
        }
      } else {
        setErrors(prev => ({ ...prev, coordinates: 'Неверный формат координат в буфере обмена' }))
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, coordinates: 'Не удалось получить данные из буфера обмена' }))
    }
  }

  const open2GIS = () => {
    window.open('https://2gis.kz', '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-mono-900">
              {warehouse ? 'Редактировать склад' : 'Создать склад'}
            </h3>
            <button
              onClick={onClose}
              className="text-mono-400 hover:text-mono-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Наименование склада */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Наименование склада *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.name ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="Введите наименование склада"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-mono-600">{errors.name}</p>}
            </div>

            {/* Адрес */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Адрес *
              </label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.address ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="Введите адрес склада"
                />
              </div>
              {errors.address && <p className="mt-1 text-sm text-mono-600">{errors.address}</p>}
            </div>

            {/* Координаты */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Координаты (2ГИС)
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formData.coordinates}
                      onChange={(e) => handleChange('coordinates', e.target.value)}
                      className={`w-full px-3 py-2 border ${errors.coordinates ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                      placeholder="43.2220, 76.8512"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePasteCoordinates}
                    className="flex items-center space-x-1 px-3 py-2 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-md transition-colors duration-200"
                    title="Вставить из буфера обмена"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Вставить</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-mono-500">
                    Формат: широта, долгота (например: 43.2220, 76.8512)
                  </p>
                  <button
                    type="button"
                    onClick={open2GIS}
                    className="text-xs text-mono-600 hover:text-mono-800 underline"
                  >
                    Открыть 2ГИС
                  </button>
                </div>
                {errors.coordinates && <p className="mt-1 text-sm text-mono-600">{errors.coordinates}</p>}
              </div>
            </div>

            {/* Инструкция по получению координат */}
            <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-mono-900 mb-2">Как получить координаты из 2ГИС:</h4>
              <ol className="text-xs text-mono-600 space-y-1 list-decimal list-inside">
                <li>Откройте <button type="button" onClick={open2GIS} className="text-mono-600 hover:text-mono-800 underline">2ГИС</button></li>
                <li>Найдите нужный адрес на карте</li>
                <li>Нажмите правой кнопкой мыши на точку</li>
                <li>Выберите "Скопировать координаты"</li>
                <li>Вернитесь в форму и нажмите "Вставить"</li>
              </ol>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-mono-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-mono-600 text-white hover:bg-mono-700 rounded-lg transition-colors duration-200"
              >
                {warehouse ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
