import React, { useState, useEffect } from 'react'
import { X, Package, Ruler, Info } from 'lucide-react'

interface Material {
  id: string
  name: string
  type: 'cement' | 'sand' | 'gravel' | 'water' | 'additive' | 'other'
  unit: 'kg' | 'm3' | 'ton' | 'liter'
  additionalInfo?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void
  material?: Material | null
}

const typeOptions = [
  { value: 'cement', label: 'Цемент' },
  { value: 'sand', label: 'Песок' },
  { value: 'gravel', label: 'Щебень' },
  { value: 'water', label: 'Вода' },
  { value: 'additive', label: 'Химии/Добавки' },
  { value: 'other', label: 'Другое' }
]

const unitOptions = [
  { value: 'kg', label: 'Килограмм (кг)' },
  { value: 'm3', label: 'Кубический метр (м³)' },
  { value: 'ton', label: 'Тонна (т)' },
  { value: 'liter', label: 'Литр (л)' }
]

export default function MaterialModal({ isOpen, onClose, onSave, material }: MaterialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'cement' as 'cement' | 'sand' | 'gravel' | 'water' | 'additive' | 'other',
    unit: 'kg' as 'kg' | 'm3' | 'ton' | 'liter',
    additionalInfo: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        type: material.type,
        unit: material.unit,
        additionalInfo: material.additionalInfo || ''
      })
    } else {
      setFormData({
        name: '',
        type: 'cement',
        unit: 'kg',
        additionalInfo: ''
      })
    }
    setErrors({})
  }, [material, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Наименование материала обязательно'
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-mono-900">
              {material ? 'Редактировать материал' : 'Создать материал'}
            </h3>
            <button
              onClick={onClose}
              className="text-mono-400 hover:text-mono-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Наименование материала */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Наименование материала *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.name ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="Введите наименование материала"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-mono-600">{errors.name}</p>}
            </div>

            {/* Тип материала */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Тип материала *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent appearance-none bg-white"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Единица измерения */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Единица измерения *
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent appearance-none bg-white"
                >
                  {unitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Дополнительная информация
              </label>
              <div className="relative">
                <Info className="absolute left-3 top-3 h-4 w-4 text-mono-400" />
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => handleChange('additionalInfo', e.target.value)}
                  rows={4}
                  className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent resize-none"
                  placeholder="Введите дополнительную информацию о материале (опционально)"
                />
              </div>
              <p className="mt-1 text-xs text-mono-500">
                Можете указать характеристики, особенности использования, производителя и т.д.
              </p>
            </div>

            {/* Примеры материалов */}
            <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-mono-900 mb-2">Примеры материалов по типам:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-mono-600">
                <div className="space-y-1">
                  <div><strong>Цемент:</strong> Портландцемент М400, М500</div>
                  <div><strong>Песок:</strong> Речной песок, карьерный песок</div>
                  <div><strong>Щебень:</strong> Гранитный, известняковый</div>
                </div>
                <div className="space-y-1">
                  <div><strong>Вода:</strong> Техническая вода</div>
                  <div><strong>Химии/Добавки:</strong> Пластификатор, ускоритель</div>
                  <div><strong>Другое:</strong> Арматура, проволока</div>
                </div>
              </div>
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
                {material ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
