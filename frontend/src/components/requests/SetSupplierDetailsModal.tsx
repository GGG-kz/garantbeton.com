import { useState } from 'react'
import { InternalRequest } from '../../types/requests'
import { Counterparty } from '../../types/directories'
import Modal from '../Modal'
import { DollarSign, Users, Package } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface SetSupplierDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onSetDetails: (requestId: string, counterpartyId: string, counterpartyName: string, price: number, notes?: string) => void
  request: InternalRequest | null
}

export default function SetSupplierDetailsModal({ isOpen, onClose, onSetDetails, request }: SetSupplierDetailsModalProps) {
  const [counterparties] = useLocalStorage<Counterparty[]>('counterparties', [])
  const [counterpartyId, setCounterpartyId] = useState<string>('')
  const [price, setPrice] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!counterpartyId) {
      newErrors.counterpartyId = 'Выберите поставщика'
    }
    
    if (price <= 0) {
      newErrors.price = 'Цена должна быть больше 0'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (request) {
      const counterparty = counterparties.find(c => c.id === counterpartyId)
      const counterpartyName = counterparty ? counterparty.name : 'Неизвестный поставщик'
      
      onSetDetails(request.id, counterpartyId, counterpartyName, price, notes)
      onClose()
      
      // Сброс формы
      setCounterpartyId('')
      setPrice(0)
      setNotes('')
      setErrors({})
    }
  }

  const handleClose = () => {
    onClose()
    setErrors({})
    setCounterpartyId('')
    setPrice(0)
    setNotes('')
  }

  if (!request) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Указать поставщика и цену" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Информация о заявке */}
        <div className="bg-mono-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="h-4 w-4 text-mono-600" />
            <span className="text-sm font-medium text-mono-700">Заявка</span>
          </div>
          <h4 className="font-medium text-mono-900">{request.title}</h4>
          <p className="text-sm text-mono-600 mt-1">{request.description}</p>
          {request.quantity && (
            <p className="text-sm text-mono-500 mt-1">
              Количество: {request.quantity} {request.unit}
            </p>
          )}
        </div>

        {/* Выбор поставщика */}
        <div>
          <label htmlFor="counterpartyId" className="block text-sm font-medium text-mono-700 mb-2">
            Поставщик *
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <select
              id="counterpartyId"
              value={counterpartyId}
              onChange={(e) => {
                setCounterpartyId(e.target.value)
                if (errors.counterpartyId) {
                  setErrors(prev => ({ ...prev, counterpartyId: '' }))
                }
              }}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.counterpartyId ? 'border-red-300' : 'border-mono-300'
              }`}
            >
              <option value="">Выберите поставщика</option>
              {counterparties
                .filter(c => c.type === 'supplier' && c.isActive)
                .map(counterparty => (
                  <option key={counterparty.id} value={counterparty.id}>
                    {counterparty.name}
                  </option>
                ))
              }
            </select>
          </div>
          {errors.counterpartyId && <p className="mt-1 text-sm text-mono-600">{errors.counterpartyId}</p>}
        </div>

        {/* Поле для цены */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-mono-700 mb-2">
            Цена (₸) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
            <input
              type="number"
              id="price"
              value={price || ''}
              onChange={(e) => {
                setPrice(parseFloat(e.target.value) || 0)
                if (errors.price) {
                  setErrors(prev => ({ ...prev, price: '' }))
                }
              }}
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

        {/* Примечания */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-mono-700 mb-2">
            Примечания к заказу
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Дополнительная информация о заказе (опционально)"
          />
        </div>

        {/* Предварительный расчет */}
        {price > 0 && request.quantity && (
          <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-black" />
              <span className="text-sm font-medium text-black">Предварительный расчет</span>
            </div>
            <div className="text-sm text-black">
              <p>Цена за единицу: <strong>{price.toLocaleString('ru-RU')} ₸</strong></p>
              <p>Количество: <strong>{request.quantity} {request.unit}</strong></p>
              <p className="font-semibold text-black mt-1">
                Общая сумма: <strong>{(price * request.quantity).toLocaleString('ru-RU')} ₸</strong>
              </p>
            </div>
          </div>
        )}

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
            Указать поставщика и цену
          </button>
        </div>
      </form>
    </Modal>
  )
}
