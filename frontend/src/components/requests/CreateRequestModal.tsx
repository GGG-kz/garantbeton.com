import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import Modal from '../Modal'
import { FileText, Package, AlertCircle, Calendar } from 'lucide-react'
import { 
  CreateRequestRequest, 
  RequestCategory, 
  RequestPriority, 
  REQUEST_CATEGORIES, 
  REQUEST_PRIORITIES 
} from '../../types/requests'

interface CreateRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateRequestRequest) => void
}

export default function CreateRequestModal({ isOpen, onClose, onSave }: CreateRequestModalProps) {
  const { user } = useAuthStore()
  
  const [formData, setFormData] = useState<CreateRequestRequest>({
    category: 'office_supplies',
    title: '',
    description: '',
    quantity: 1,
    unit: 'шт',
    status: 'pending',
    priority: 'medium',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof CreateRequestRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно'
    }
    
    if (formData.quantity && formData.quantity <= 0) {
      newErrors.quantity = 'Количество должно быть больше 0'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
    onClose()
    
    // Сброс формы
    setFormData({
      category: 'office_supplies',
      title: '',
      description: '',
      quantity: 1,
      unit: 'шт',
      status: 'pending',
      priority: 'medium',
      notes: ''
    })
    setErrors({})
  }

  const handleClose = () => {
    onClose()
    setErrors({})
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создать заявку" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Информация о заявителе */}
        <div className="bg-mono-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-4 w-4 text-mono-600" />
            <span className="text-sm font-medium text-mono-700">Заявитель</span>
          </div>
          <p className="text-sm text-mono-600">{user?.fullName || user?.login}</p>
        </div>

        {/* Категория и приоритет */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-mono-700 mb-2">
              Категория *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as RequestCategory)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.category ? 'border-red-300' : 'border-mono-300'
              }`}
            >
              {Object.entries(REQUEST_CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-mono-600">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-mono-700 mb-2">
              Приоритет
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as RequestPriority)}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {Object.entries(REQUEST_PRIORITIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Название заявки */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-mono-700 mb-2">
            Название заявки *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.title ? 'border-red-300' : 'border-mono-300'
            }`}
            placeholder="Краткое описание заявки"
          />
          {errors.title && <p className="mt-1 text-sm text-mono-600">{errors.title}</p>}
        </div>

        {/* Описание */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-mono-700 mb-2">
            Описание *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.description ? 'border-red-300' : 'border-mono-300'
            }`}
            placeholder="Подробное описание заявки"
          />
          {errors.description && <p className="mt-1 text-sm text-mono-600">{errors.description}</p>}
        </div>

        {/* Количество и единица измерения */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-mono-700 mb-2">
              Количество
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="number"
                id="quantity"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.quantity ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="1"
                min="1"
              />
            </div>
            {errors.quantity && <p className="mt-1 text-sm text-mono-600">{errors.quantity}</p>}
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-mono-700 mb-2">
              Единица измерения
            </label>
            <select
              id="unit"
              value={formData.unit || 'шт'}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="шт">Штук</option>
              <option value="комплект">Комплект</option>
              <option value="упаковка">Упаковка</option>
              <option value="кг">Килограмм</option>
              <option value="л">Литр</option>
              <option value="м">Метр</option>
              <option value="м²">Квадратный метр</option>
              <option value="м³">Кубический метр</option>
              <option value="час">Час</option>
              <option value="день">День</option>
            </select>
          </div>
        </div>

        {/* Дополнительные примечания */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-mono-700 mb-2">
            Дополнительные примечания
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Дополнительная информация (необязательно)"
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-mono-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors duration-200"
          >
            Создать заявку
          </button>
        </div>
      </form>
    </Modal>
  )
}
