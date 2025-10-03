import React, { useState } from 'react'
import { Truck, Weight, Save, Plus } from 'lucide-react'
import { WeighingDraft, CreateWeighingDraftRequest } from '../../types/receiptInvoice'
import { useAuthStore } from '../../stores/authStore'

interface ArrivalWeighingProps {
  drafts: WeighingDraft[]
  onDraftCreated: (draft: WeighingDraft) => void
  onDraftUpdated: (draft: WeighingDraft) => void
  currentWeight?: number
  onWeightRequest: () => void
}

export default function ArrivalWeighing({ 
  drafts, 
  onDraftCreated, 
  onDraftUpdated, 
  currentWeight,
  onWeightRequest 
}: ArrivalWeighingProps) {
  const { user } = useAuthStore()
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Получаем только черновики (не завершенные)
  const activeDrafts = drafts.filter(draft => draft.status === 'draft')

  const handleCreateDraft = () => {
    if (!vehicleNumber.trim()) {
      alert('Введите гос. номер машины')
      return
    }

    if (!currentWeight || currentWeight <= 0) {
      alert('Получите вес с весов перед созданием черновика')
      return
    }

    // Проверяем, нет ли уже черновика с таким номером
    const existingDraft = activeDrafts.find(draft => 
      draft.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase()
    )

    if (existingDraft) {
      alert('Черновик с таким гос. номером уже существует')
      return
    }

    const newDraft: WeighingDraft = {
      id: Date.now().toString(),
      vehicleNumber: vehicleNumber.trim(),
      bruttoWeight: currentWeight,
      bruttoDateTime: new Date().toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.login || 'unknown'
    }

    onDraftCreated(newDraft)
    setVehicleNumber('')
    setIsCreating(false)
  }

  const handleGetBrutto = (draft: WeighingDraft) => {
    if (!currentWeight || currentWeight <= 0) {
      alert('Получите вес с весов')
      return
    }

    const updatedDraft: WeighingDraft = {
      ...draft,
      bruttoWeight: currentWeight,
      bruttoDateTime: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onDraftUpdated(updatedDraft)
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
        <Truck className="h-5 w-5 text-black" />
        <h3 className="text-lg font-medium text-mono-900">Шаг 1: Въезд (БРУТТО)</h3>
      </div>

      {/* Текущий вес */}
      <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-black">Текущий вес</h4>
            <p className="text-2xl font-bold text-black">
              {currentWeight ? formatWeight(currentWeight) : '—'}
            </p>
          </div>
          <button
            onClick={onWeightRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black"
          >
            <Weight className="h-4 w-4" />
            <span>Получить вес</span>
          </button>
        </div>
      </div>

      {/* Создание нового черновика */}
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-mono-300 rounded-lg hover:border-mono-400 hover:bg-mono-50"
        >
          <Plus className="h-5 w-5 text-mono-400" />
          <span className="text-mono-600">Добавить машину</span>
        </button>
      ) : (
        <div className="bg-white border border-mono-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-mono-900 mb-3">Создать черновик</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Гос. номер машины
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="Например: 01ABC123"
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                autoFocus
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateDraft}
                className="flex items-center space-x-2 px-4 py-2 bg-mono-600 text-white rounded-lg hover:bg-mono-700"
              >
                <Save className="h-4 w-4" />
                <span>Сохранить черновик</span>
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setVehicleNumber('')
                }}
                className="px-4 py-2 border border-mono-300 text-mono-700 rounded-lg hover:bg-mono-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список активных черновиков */}
      {activeDrafts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-mono-900">
            Активные черновики ({activeDrafts.length})
          </h4>
          {activeDrafts.map((draft) => (
            <div key={draft.id} className="bg-mono-50 border border-mono-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-mono-600" />
                  <span className="font-medium text-mono-900">{draft.vehicleNumber}</span>
                </div>
                <span className="text-xs text-mono-500">
                  {formatDateTime(draft.createdAt)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-mono-600">БРУТТО:</span>
                  <span className="ml-2 font-medium">
                    {formatWeight(draft.bruttoWeight)}
                  </span>
                </div>
                <div>
                  <span className="text-mono-600">Время:</span>
                  <span className="ml-2">
                    {formatDateTime(draft.bruttoDateTime)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handleGetBrutto(draft)}
                  className="flex items-center space-x-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-black text-sm"
                >
                  <Weight className="h-4 w-4" />
                  <span>Обновить БРУТТО</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
