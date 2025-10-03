import React, { useState } from 'react'
import { Truck, Weight, CheckCircle, Search, Save } from 'lucide-react'
import { WeighingDraft } from '../../types/receiptInvoice'
import { useAuthStore } from '../../stores/authStore'

interface DepartureWeighingProps {
  drafts: WeighingDraft[]
  onDraftCompleted: (draft: WeighingDraft) => void
  currentWeight?: number
  onWeightRequest: () => void
}

export default function DepartureWeighing({ 
  drafts, 
  onDraftCompleted, 
  currentWeight,
  onWeightRequest 
}: DepartureWeighingProps) {
  const { user } = useAuthStore()
  const [searchNumber, setSearchNumber] = useState('')
  const [selectedDraft, setSelectedDraft] = useState<WeighingDraft | null>(null)
  const [formData, setFormData] = useState({
    supplier: '',
    recipient: '',
    cargo: '',
    warehouse: ''
  })

  // Получаем только черновики (не завершенные)
  const activeDrafts = drafts.filter(draft => draft.status === 'draft')

  const handleSearch = () => {
    if (!searchNumber.trim()) {
      alert('Введите гос. номер для поиска')
      return
    }

    const foundDraft = activeDrafts.find(draft => 
      draft.vehicleNumber.toLowerCase().includes(searchNumber.toLowerCase())
    )

    if (foundDraft) {
      setSelectedDraft(foundDraft)
      setFormData({
        supplier: foundDraft.supplier || '',
        recipient: foundDraft.recipient || '',
        cargo: foundDraft.cargo || '',
        warehouse: foundDraft.warehouse || ''
      })
    } else {
      alert('Черновик с таким гос. номером не найден')
      setSelectedDraft(null)
    }
  }

  const handleGetTara = () => {
    if (!selectedDraft) return

    if (!currentWeight || currentWeight <= 0) {
      alert('Получите вес с весов')
      return
    }

    const updatedDraft: WeighingDraft = {
      ...selectedDraft,
      taraWeight: currentWeight,
      taraDateTime: new Date().toISOString(),
      netWeight: selectedDraft.bruttoWeight - currentWeight,
      updatedAt: new Date().toISOString()
    }

    setSelectedDraft(updatedDraft)
  }

  const handleComplete = () => {
    if (!selectedDraft) return

    if (!selectedDraft.taraWeight) {
      alert('Получите вес ТАРА перед завершением')
      return
    }

    if (!formData.supplier || !formData.recipient || !formData.cargo) {
      alert('Заполните все обязательные поля: поставщик, получатель, груз')
      return
    }

    const completedDraft: WeighingDraft = {
      ...selectedDraft,
      supplier: formData.supplier,
      recipient: formData.recipient,
      cargo: formData.cargo,
      warehouse: formData.warehouse,
      status: 'completed',
      updatedAt: new Date().toISOString()
    }

    onDraftCompleted(completedDraft)
    setSelectedDraft(null)
    setSearchNumber('')
    setFormData({ supplier: '', recipient: '', cargo: '', warehouse: '' })
  }

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(2)} кг`
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('ru-RU')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Truck className="h-5 w-5 text-mono-600" />
        <h3 className="text-lg font-medium text-mono-900">Шаг 2: Выезд (ТАРА)</h3>
      </div>

      {/* Поиск черновика */}
      <div className="bg-white border border-mono-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-mono-900 mb-3">Найти черновик</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value.toUpperCase())}
            placeholder="Введите гос. номер машины"
            className="flex-1 px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
          />
          <button
            onClick={handleSearch}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black"
          >
            <Search className="h-4 w-4" />
            <span>Найти</span>
          </button>
        </div>
      </div>

      {/* Информация о найденном черновике */}
      {selectedDraft && (
        <div className="bg-mono-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Truck className="h-5 w-5 text-mono-600" />
            <h4 className="font-medium text-mono-900">{selectedDraft.vehicleNumber}</h4>
          </div>

          {/* Текущий вес */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-mono-900">Текущий вес</h5>
                <p className="text-xl font-bold text-mono-600">
                  {currentWeight ? formatWeight(currentWeight) : '—'}
                </p>
              </div>
              <button
                onClick={onWeightRequest}
                className="flex items-center space-x-2 px-3 py-2 bg-mono-600 text-white rounded-lg hover:bg-mono-700 text-sm"
              >
                <Weight className="h-4 w-4" />
                <span>Получить вес</span>
              </button>
            </div>
          </div>

          {/* Данные взвешивания */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-mono-700">БРУТТО:</span>
              <span className="ml-2 font-medium">
                {formatWeight(selectedDraft.bruttoWeight)}
              </span>
            </div>
            <div>
              <span className="text-mono-700">ТАРА:</span>
              <span className="ml-2 font-medium">
                {selectedDraft.taraWeight ? formatWeight(selectedDraft.taraWeight) : '—'}
              </span>
            </div>
            <div>
              <span className="text-mono-700">НЕТТО:</span>
              <span className="ml-2 font-bold text-mono-800">
                {selectedDraft.netWeight ? formatWeight(selectedDraft.netWeight) : '—'}
              </span>
            </div>
            <div>
              <span className="text-mono-700">Время въезда:</span>
              <span className="ml-2">
                {formatDateTime(selectedDraft.bruttoDateTime)}
              </span>
            </div>
          </div>

          {/* Кнопка получения ТАРА */}
          {!selectedDraft.taraWeight && (
            <button
              onClick={handleGetTara}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 mb-4"
            >
              <Weight className="h-5 w-5" />
              <span>Получить ТАРА</span>
            </button>
          )}

          {/* Форма для завершения */}
          {selectedDraft.taraWeight && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-mono-900">Завершить взвешивание</h5>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-mono-700 mb-1">
                    Поставщик *
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-2 py-1 border border-mono-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="Название поставщика"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mono-700 mb-1">
                    Получатель *
                  </label>
                  <input
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                    className="w-full px-2 py-1 border border-mono-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="Название получателя"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mono-700 mb-1">
                    Груз *
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    className="w-full px-2 py-1 border border-mono-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="Тип груза"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mono-700 mb-1">
                    Склад
                  </label>
                  <input
                    type="text"
                    value={formData.warehouse}
                    onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                    className="w-full px-2 py-1 border border-mono-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="Название склада"
                  />
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-mono-600 text-white rounded-lg hover:bg-mono-700"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Обновить и сохранить</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Список всех черновиков для справки */}
      {activeDrafts.length > 0 && (
        <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-mono-900 mb-3">
            Все черновики ({activeDrafts.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activeDrafts.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                <span className="font-medium">{draft.vehicleNumber}</span>
                <span className="text-mono-500">
                  БРУТТО: {formatWeight(draft.bruttoWeight)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
