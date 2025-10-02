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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        address: warehouse.address,
        phone: warehouse.phone || '',
      })
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
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

        {/* Координаты и телефон */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="coordinates" className="block text-sm font-medium text-mono-700 mb-2">
              Координаты для карт
            </label>
            <div className="relative">
              <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                id="coordinates"
                value={formData.coordinates}
                onChange={(e) => handleChange('coordinates', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="51.1694, 71.4491 (широта, долгота)"
              />
            </div>
            <p className="mt-1 text-xs text-mono-500">
              Можно скопировать из 2ГИС, Яндекс.Карт или Google Maps
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-mono-700 mb-2">
              Телефон
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+7 (7172) 123-45-67"
              />
            </div>
          </div>
        </div>

        {/* Настройки весов */}
        <div className="border-t border-mono-200 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">⚖️</span>
              <h3 className="text-lg font-medium text-mono-900">Настройки весов</h3>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.scalesEnabled}
                  onChange={(e) => handleChange('scalesEnabled', e.target.checked)}
                  className="rounded border-mono-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium text-mono-700">Включить весы на этом складе</span>
                  <p className="text-xs text-mono-500">Позволит автоматически взвешивать материалы при приемке</p>
                </div>
              </label>
            </div>

            {formData.scalesEnabled && (
              <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-black mb-4">Конфигурация весов</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="scalesComPort" className="block text-sm font-medium text-mono-700 mb-2">
                      COM порт весов *
                    </label>
                    <select
                      id="scalesComPort"
                      value={formData.scalesComPort}
                      onChange={(e) => handleChange('scalesComPort', e.target.value)}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Выберите порт</option>
                      <option value="COM1">COM1</option>
                      <option value="COM2">COM2</option>
                      <option value="COM3">COM3</option>
                      <option value="COM4">COM4</option>
                      <option value="COM5">COM5</option>
                      <option value="COM6">COM6</option>
                      <option value="COM7">COM7</option>
                      <option value="COM8">COM8</option>
                    </select>
                    <p className="text-xs text-mono-500 mt-1">Порт к которому подключены весы</p>
                  </div>

                  <div>
                    <label htmlFor="scalesModel" className="block text-sm font-medium text-mono-700 mb-2">
                      Модель весов
                    </label>
                    <input
                      type="text"
                      id="scalesModel"
                      value={formData.scalesModel}
                      onChange={(e) => handleChange('scalesModel', e.target.value)}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Например: CAS SW-1, Mettler Toledo, Avery Weigh-Tronix"
                    />
                    <p className="text-xs text-mono-500 mt-1">Модель весов для правильной настройки протокола</p>
                  </div>
                </div>

                {/* Информация о настройках по умолчанию */}
                <div className="mt-4 p-3 bg-white border border-mono-200 rounded-lg">
                  <h5 className="text-sm font-medium text-mono-900 mb-2">Настройки по умолчанию:</h5>
                  <div className="grid grid-cols-2 gap-4 text-xs text-mono-600">
                    <div>
                      <span className="font-medium">Скорость:</span> 9600 bps
                    </div>
                    <div>
                      <span className="font-medium">Данные:</span> 8N1
                    </div>
                    <div>
                      <span className="font-medium">Четность:</span> none
                    </div>
                    <div>
                      <span className="font-medium">Стоп-биты:</span> 1
                    </div>
                  </div>
                  <p className="text-xs text-mono-500 mt-2">
                    Эти настройки будут использоваться автоматически. При необходимости их можно изменить в разделе "Настройки весов".
                  </p>
                </div>
              </div>
            )}
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
