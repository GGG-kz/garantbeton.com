import { useState, useEffect } from 'react'
import { ConcreteGrade, CreateConcreteGradeRequest } from '../../types/directories'
import { Layers, Package, Mountain, Circle, Droplets } from 'lucide-react'

interface ConcreteGradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateConcreteGradeRequest) => void
  concreteGrade?: ConcreteGrade | null
  title: string
}

export default function ConcreteGradeModal({ isOpen, onClose, onSave, concreteGrade, title }: ConcreteGradeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    description: '',
    cementConsumption: 0,
    gravelConsumption: 0,
    sandConsumption: 0,
    plasticizerConsumption: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (concreteGrade) {
      setFormData({
        name: concreteGrade.name,
        grade: concreteGrade.grade,
        description: concreteGrade.description || '',
        cementConsumption: concreteGrade.cementConsumption || 0,
        gravelConsumption: concreteGrade.gravelConsumption || 0,
        sandConsumption: concreteGrade.sandConsumption || 0,
        plasticizerConsumption: concreteGrade.plasticizerConsumption || 0,
      })
    } else {
      setFormData({
        name: '',
        grade: '',
        description: '',
        cementConsumption: 0,
        gravelConsumption: 0,
        sandConsumption: 0,
        plasticizerConsumption: 0,
      })
    }
    setErrors({})
  }, [concreteGrade, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно'
    }
    
    if (!formData.grade.trim()) {
      newErrors.grade = 'Марка обязательна'
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
              <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="М100"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-mono-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-mono-700 mb-2">
              Марка *
            </label>
            <input
              type="text"
              id="grade"
              value={formData.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.grade ? 'border-red-300' : 'border-mono-300'
              }`}
              placeholder="М100"
            />
            {errors.grade && <p className="mt-1 text-sm text-mono-600">{errors.grade}</p>}
          </div>
        </div>


        {/* Расход материалов */}
        <div>
          <h3 className="text-lg font-medium text-mono-900 mb-4">Расход материалов на 1 м³</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="cementConsumption" className="block text-sm font-medium text-mono-700 mb-2">
                Расход цемента (кг)
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="number"
                  id="cementConsumption"
                  value={formData.cementConsumption}
                  onChange={(e) => handleChange('cementConsumption', parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="300"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="gravelConsumption" className="block text-sm font-medium text-mono-700 mb-2">
                Расход щебня (кг)
              </label>
              <div className="relative">
                <Mountain className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="number"
                  id="gravelConsumption"
                  value={formData.gravelConsumption}
                  onChange={(e) => handleChange('gravelConsumption', parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="1200"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sandConsumption" className="block text-sm font-medium text-mono-700 mb-2">
                Расход песка (кг)
              </label>
              <div className="relative">
                <Circle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="number"
                  id="sandConsumption"
                  value={formData.sandConsumption}
                  onChange={(e) => handleChange('sandConsumption', parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="600"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="plasticizerConsumption" className="block text-sm font-medium text-mono-700 mb-2">
                Расход пластификатора (л)
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="number"
                  step="0.1"
                  id="plasticizerConsumption"
                  value={formData.plasticizerConsumption}
                  onChange={(e) => handleChange('plasticizerConsumption', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="2.5"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Описание */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-mono-700 mb-2">
            Описание
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Описание применения бетона"
          />
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
