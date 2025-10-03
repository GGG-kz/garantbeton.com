import React, { useState, useEffect } from 'react'
import { X, Package, Plus, Trash2, Info } from 'lucide-react'

interface Material {
  id: string
  name: string
  type: 'cement' | 'sand' | 'gravel' | 'water' | 'additive' | 'other'
  unit: 'kg' | 'm3' | 'ton' | 'liter'
}

interface MaterialConsumption {
  id: string
  materialId: string
  materialName: string
  materialType: string
  consumption: number
  unit: string
}

interface ConcreteGrade {
  id: string
  name: string
  description?: string
  materialConsumptions: MaterialConsumption[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ConcreteGradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<ConcreteGrade, 'id' | 'createdAt' | 'updatedAt'>) => void
  concreteGrade?: ConcreteGrade | null
  materials: Material[]
}

export default function ConcreteGradeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  concreteGrade, 
  materials 
}: ConcreteGradeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    materialConsumptions: [] as MaterialConsumption[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (concreteGrade) {
      setFormData({
        name: concreteGrade.name,
        description: concreteGrade.description || '',
        materialConsumptions: concreteGrade.materialConsumptions || []
      })
    } else {
      setFormData({
        name: '',
        description: '',
        materialConsumptions: []
      })
    }
    setErrors({})
  }, [concreteGrade, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Наименование марки бетона обязательно'
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

  const addMaterialConsumption = () => {
    const newConsumption: MaterialConsumption = {
      id: Date.now().toString(),
      materialId: '',
      materialName: '',
      materialType: '',
      consumption: 0,
      unit: 'кг'
    }
    setFormData(prev => ({
      ...prev,
      materialConsumptions: [...prev.materialConsumptions, newConsumption]
    }))
  }

  const removeMaterialConsumption = (id: string) => {
    setFormData(prev => ({
      ...prev,
      materialConsumptions: prev.materialConsumptions.filter(item => item.id !== id)
    }))
  }

  const updateMaterialConsumption = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      materialConsumptions: prev.materialConsumptions.map(item => {
        if (item.id === id) {
          if (field === 'materialId') {
            const material = materials.find(m => m.id === value)
            return {
              ...item,
              materialId: value,
              materialName: material?.name || '',
              materialType: material?.type || '',
              unit: material?.unit === 'kg' ? 'кг' : 
                    material?.unit === 'm3' ? 'м³' : 
                    material?.unit === 'ton' ? 'т' : 'л'
            }
          }
          return { ...item, [field]: value }
        }
        return item
      })
    }))
  }

  const getMaterialsByType = (type: string) => {
    return materials.filter(material => material.type === type)
  }

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'cement': 'Цемент',
      'sand': 'Песок',
      'gravel': 'Щебень',
      'water': 'Вода',
      'additive': 'Химии/Добавки',
      'other': 'Другое'
    }
    return typeLabels[type] || 'Неизвестно'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-mono-900">
              {concreteGrade ? 'Редактировать марку бетона' : 'Создать марку бетона'}
            </h3>
            <button
              onClick={onClose}
              className="text-mono-400 hover:text-mono-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Наименование марки бетона */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Наименование марки бетона *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border ${errors.name ? 'border-mono-500' : 'border-mono-300'} rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent`}
                  placeholder="Например: М200, М300, М400"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-mono-600">{errors.name}</p>}
            </div>

            {/* Описание марки бетона */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Описание марки бетона
              </label>
              <div className="relative">
                <Info className="absolute left-3 top-3 h-4 w-4 text-mono-400" />
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="pl-10 w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent resize-none"
                  placeholder="Описание назначения и характеристик марки бетона"
                />
              </div>
            </div>

            {/* Расходы материалов */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-mono-700">
                  Расходы материалов
                </label>
                <button
                  type="button"
                  onClick={addMaterialConsumption}
                  className="flex items-center space-x-2 px-3 py-2 bg-mono-600 hover:bg-mono-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Добавить материал</span>
                </button>
              </div>

              {formData.materialConsumptions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-mono-300 rounded-lg">
                  <Package className="h-8 w-8 text-mono-400 mx-auto mb-2" />
                  <p className="text-mono-500">Нажмите "Добавить материал" для добавления расходов</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.materialConsumptions.map((consumption, index) => (
                    <div key={consumption.id} className="border border-mono-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-medium text-mono-900">
                          Материал #{index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeMaterialConsumption(consumption.id)}
                          className="text-mono-400 hover:text-mono-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Выбор материала */}
                        <div>
                          <label className="block text-xs font-medium text-mono-700 mb-1">
                            Материал
                          </label>
                          <select
                            value={consumption.materialId}
                            onChange={(e) => updateMaterialConsumption(consumption.id, 'materialId', e.target.value)}
                            className="w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                          >
                            <option value="">Выберите материал</option>
                            {materials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name} ({getTypeLabel(material.type)})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Расход */}
                        <div>
                          <label className="block text-xs font-medium text-mono-700 mb-1">
                            Расход за 1 м³
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              value={consumption.consumption}
                              onChange={(e) => updateMaterialConsumption(consumption.id, 'consumption', parseFloat(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 border border-mono-300 rounded-l-md focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                              placeholder="0"
                              min="0"
                              step="0.1"
                            />
                            <span className="px-3 py-2 bg-mono-100 border border-l-0 border-mono-300 rounded-r-md text-sm text-mono-700">
                              {consumption.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Примеры марок бетона */}
            <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-mono-900 mb-2">Примеры марок бетона:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-mono-600">
                <div className="space-y-1">
                  <div><strong>М100:</strong> Для подготовительных работ</div>
                  <div><strong>М200:</strong> Для фундаментов, отмосток</div>
                  <div><strong>М300:</strong> Для монолитных конструкций</div>
                </div>
                <div className="space-y-1">
                  <div><strong>М400:</strong> Для ответственных конструкций</div>
                  <div><strong>М500:</strong> Для специальных сооружений</div>
                  <div><strong>М600:</strong> Для высоконагруженных конструкций</div>
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
                {concreteGrade ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
