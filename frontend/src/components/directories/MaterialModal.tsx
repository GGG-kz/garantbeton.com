import { useState, useEffect } from 'react'
import { Material, CreateMaterialRequest } from '../../types/directories'
import { Package } from 'lucide-react'

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateMaterialRequest) => void
  material?: Material | null
  title: string
}

export default function MaterialModal({ isOpen, onClose, onSave, material, title }: MaterialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'cement' as 'cement' | 'sand' | 'gravel' | 'water' | 'additive',
    unit: 'ton' as 'kg' | 'ton' | 'm3' | 'liter',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        type: material.type,
        unit: material.unit,
      })
    } else {
      setFormData({
        name: '',
        type: 'cement',
        unit: 'ton',
      })
    }
    setErrors({})
  }, [material, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
    onClose()
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-mono-700 mb-2">
              Название *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="Название материала"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-mono-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-mono-700 mb-2">
              Тип материала *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value as 'cement' | 'sand' | 'gravel' | 'water' | 'additive')}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="cement">Цемент</option>
              <option value="sand">Песок</option>
              <option value="gravel">Щебень</option>
              <option value="water">Вода</option>
              <option value="additive">Добавка</option>
            </select>
          </div>
        </div>

        {/* Единица измерения и цена */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-mono-700 mb-2">
              Единица измерения *
            </label>
            <select
              id="unit"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value as 'kg' | 'ton' | 'm3' | 'liter')}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="kg">кг</option>
              <option value="ton">т</option>
              <option value="m3">м³</option>
              <option value="liter">л</option>
            </select>
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
