import { useState, useEffect } from 'react'
import { Price, CreatePriceRequest, Counterparty, ConcreteGrade, Material } from '../../types/directories'
import { DollarSign, Building, Package, Calendar, FileText } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface PriceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreatePriceRequest) => void
  price?: Price | null
  title: string
}

// Пустые массивы - данные хранятся в localStorage
const emptyCounterparties: Counterparty[] = []

const emptyConcreteGrades: ConcreteGrade[] = []

const emptyMaterials: Material[] = []

export default function PriceModal({ isOpen, onClose, onSave, price, title }: PriceModalProps) {
  const [counterparties] = useLocalStorage<Counterparty[]>('counterparties', emptyCounterparties)
  const [concreteGrades] = useLocalStorage<ConcreteGrade[]>('concreteGrades', emptyConcreteGrades)
  const [materials] = useLocalStorage<Material[]>('materials', emptyMaterials)

  const [formData, setFormData] = useState({
    counterpartyId: '',
    concreteGradeId: '',
    materialId: '',
    price: 0,
    currency: 'KZT' as 'KZT',
    validFrom: new Date().toISOString().split('T')[0], // Сегодняшняя дата
    validTo: '',
    notes: '',
    priceType: 'concrete' as 'concrete' | 'material', // Тип цены
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (price) {
      setFormData({
        counterpartyId: price.counterpartyId,
        concreteGradeId: price.concreteGradeId || '',
        materialId: price.materialId || '',
        price: price.price,
        currency: price.currency,
        validFrom: price.validFrom.split('T')[0],
        validTo: price.validTo ? price.validTo.split('T')[0] : '',
        notes: price.notes || '',
        priceType: price.concreteGradeId ? 'concrete' : 'material',
      })
    } else {
      setFormData({
        counterpartyId: '',
        concreteGradeId: '',
        materialId: '',
        price: 0,
        currency: 'KZT',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
        notes: '',
        priceType: 'concrete',
      })
    }
    setErrors({})
  }, [price, isOpen])

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.counterpartyId) {
      newErrors.counterpartyId = 'Контрагент обязателен'
    }

    if (formData.priceType === 'concrete' && !formData.concreteGradeId) {
      newErrors.concreteGradeId = 'Марка бетона обязательна'
    }

    if (formData.priceType === 'material' && !formData.materialId) {
      newErrors.materialId = 'Материал обязателен'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Цена должна быть больше 0'
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Дата начала обязательна'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Подготавливаем данные для сохранения
    const counterparty = counterparties.find(c => c.id === formData.counterpartyId)
    const concreteGrade = concreteGrades.find(g => g.id === formData.concreteGradeId)
    const material = materials.find(m => m.id === formData.materialId)
    
    const saveData: CreatePriceRequest = {
      name: formData.priceType === 'concrete' ? 
        `${counterparty?.name} - ${concreteGrade?.name}` : 
        `${counterparty?.name} - ${material?.name}`,
      counterpartyId: formData.counterpartyId,
      concreteGradeId: formData.priceType === 'concrete' ? formData.concreteGradeId : undefined,
      materialId: formData.priceType === 'material' ? formData.materialId : undefined,
      price: formData.price,
      currency: formData.currency,
      validFrom: formData.validFrom + 'T00:00:00Z',
      validTo: formData.validTo ? formData.validTo + 'T23:59:59Z' : undefined,
      notes: formData.notes,
    }

    onSave(saveData)
    onClose()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Тип цены */}
        <div>
          <label className="block text-sm font-medium text-mono-700 mb-2">
            Тип цены *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="priceType"
                value="concrete"
                checked={formData.priceType === 'concrete'}
                onChange={(e) => handleChange('priceType', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-mono-700">Марка бетона</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priceType"
                value="material"
                checked={formData.priceType === 'material'}
                onChange={(e) => handleChange('priceType', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-mono-700">Материал</span>
            </label>
          </div>
        </div>

        {/* Контрагент */}
        <div>
          <label htmlFor="counterpartyId" className="block text-sm font-medium text-mono-700 mb-2">
            Контрагент *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <select
              id="counterpartyId"
              value={formData.counterpartyId}
              onChange={(e) => handleChange('counterpartyId', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.counterpartyId ? 'border-red-300' : 'border-mono-300'
              }`}
            >
              <option value="">Выберите контрагента</option>
              {counterparties
                .filter(cp => cp.isActive)
                .map(cp => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name} ({cp.type === 'client' ? 'Клиент' : 'Поставщик'})
                  </option>
                ))
              }
            </select>
          </div>
          {errors.counterpartyId && <p className="mt-1 text-sm text-mono-600">{errors.counterpartyId}</p>}
        </div>

        {/* Марка бетона или Материал */}
        {formData.priceType === 'concrete' ? (
          <div>
            <label htmlFor="concreteGradeId" className="block text-sm font-medium text-mono-700 mb-2">
              Марка бетона *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <select
                id="concreteGradeId"
                value={formData.concreteGradeId}
                onChange={(e) => handleChange('concreteGradeId', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.concreteGradeId ? 'border-red-300' : 'border-mono-300'
                }`}
              >
                <option value="">Выберите марку бетона</option>
                {concreteGrades
                  .filter(grade => grade.isActive)
                  .map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.grade} - {grade.name}
                    </option>
                  ))
                }
              </select>
            </div>
            {errors.concreteGradeId && <p className="mt-1 text-sm text-mono-600">{errors.concreteGradeId}</p>}
          </div>
        ) : (
          <div>
            <label htmlFor="materialId" className="block text-sm font-medium text-mono-700 mb-2">
              Материал *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <select
                id="materialId"
                value={formData.materialId}
                onChange={(e) => handleChange('materialId', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.materialId ? 'border-red-300' : 'border-mono-300'
                }`}
              >
                <option value="">Выберите материал</option>
                {materials
                  .filter(material => material.isActive)
                  .map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.type}, {material.unit})
                    </option>
                  ))
                }
              </select>
            </div>
            {errors.materialId && <p className="mt-1 text-sm text-mono-600">{errors.materialId}</p>}
          </div>
        )}

        {/* Цена и валюта */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-mono-700 mb-2">
              Цена (₸) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.price ? 'border-red-300' : 'border-mono-300'
                }`}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-mono-600">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-mono-700 mb-2">
              Валюта
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="KZT">₸ Тенге</option>
            </select>
          </div>
        </div>

        {/* Период действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="validFrom" className="block text-sm font-medium text-mono-700 mb-2">
              Дата начала действия *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="date"
                id="validFrom"
                value={formData.validFrom}
                onChange={(e) => handleChange('validFrom', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.validFrom ? 'border-red-300' : 'border-mono-300'
                }`}
              />
            </div>
            {errors.validFrom && <p className="mt-1 text-sm text-mono-600">{errors.validFrom}</p>}
          </div>

          <div>
            <label htmlFor="validTo" className="block text-sm font-medium text-mono-700 mb-2">
              Дата окончания действия
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
              <input
                type="date"
                id="validTo"
                value={formData.validTo}
                onChange={(e) => handleChange('validTo', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <p className="mt-1 text-xs text-mono-500">Оставьте пустым для бессрочного действия</p>
          </div>
        </div>

        {/* Примечания */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-mono-700 mb-2">
            Примечания
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-mono-400" />
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Дополнительная информация о цене..."
            />
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
