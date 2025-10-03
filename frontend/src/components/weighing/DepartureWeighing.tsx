import React, { useState, useEffect } from 'react';
import { WeighingDraft, CompleteWeighingRequest, formatWeight, formatTimestamp, calculateNetWeight } from '../../types/weighing';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuthStore } from '../../stores/authStore';

interface DepartureWeighingProps {
  currentWeight: number | null;
  onWeightChange: (weight: number) => void;
  isConnected: boolean;
  onConnect: () => void;
  onGetWeight: () => void;
  isLoading: boolean;
}

const DepartureWeighing: React.FC<DepartureWeighingProps> = ({
  currentWeight,
  onWeightChange,
  isConnected,
  onConnect,
  onGetWeight,
  isLoading
}) => {
  const { user } = useAuthStore();
  const [drafts, setDrafts] = useLocalStorage<WeighingDraft[]>('weighingDrafts', []);
  const [selectedDraft, setSelectedDraft] = useState<WeighingDraft | null>(null);
  const [searchNumber, setSearchNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Поля для завершения взвешивания
  const [supplier, setSupplier] = useState('');
  const [recipient, setRecipient] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [notes, setNotes] = useState('');

  // Очистка сообщений
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Поиск черновика по номеру
  const findDraftByNumber = (number: string) => {
    const foundDraft = drafts.find(draft => 
      draft.vehicleNumber === number.trim().toUpperCase() && draft.status === 'draft'
    );
    
    if (foundDraft) {
      setSelectedDraft(foundDraft);
      setSupplier('');
      setRecipient('');
      setCargoType('');
      setNotes('');
      setSuccess('Черновик найден!');
    } else {
      setError('Черновик с таким номером не найден');
    }
  };

  // Завершение взвешивания
  const completeWeighing = () => {
    if (!selectedDraft) {
      setError('Выберите черновик для завершения');
      return;
    }

    if (!currentWeight) {
      setError('Получите вес перед завершением записи');
      return;
    }

    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    const netWeight = calculateNetWeight(selectedDraft.grossWeight, currentWeight);

    const completedDraft: WeighingDraft = {
      ...selectedDraft,
      tareWeight: currentWeight,
      tareTimestamp: new Date().toISOString(),
      netWeight: netWeight,
      supplier: supplier.trim() || undefined,
      recipient: recipient.trim() || undefined,
      cargoType: cargoType.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'completed',
      updatedAt: new Date().toISOString()
    };

    const updatedDrafts = drafts.map(draft => 
      draft.id === selectedDraft.id ? completedDraft : draft
    );

    setDrafts(updatedDrafts);
    setSelectedDraft(null);
    setSearchNumber('');
    setSupplier('');
    setRecipient('');
    setCargoType('');
    setNotes('');
    setSuccess('Взвешивание завершено успешно!');
  };

  // Получение незавершенных черновиков
  const pendingDrafts = drafts.filter(draft => draft.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-mono-900 mb-2">
          🚚 Выезд (Тара)
        </h2>
        <p className="text-mono-600">
          Взвешивание машин после разгрузки
        </p>
      </div>

      {/* Статус подключения */}
      <div className="p-4 bg-mono-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-mono-700">Статус весов:</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-mono-500' : 'bg-mono-500'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-mono-700' : 'text-red-700'}`}>
              {isConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
        </div>
        
        {!isConnected && (
          <button
            onClick={onConnect}
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black disabled:bg-mono-400 transition-colors"
          >
            {isLoading ? 'Подключение...' : 'Подключить'}
          </button>
        )}
      </div>

      {/* Текущий вес */}
      <div className="p-6 bg-mono-50 border border-mono-200 rounded-lg text-center">
        <div className="text-sm text-black mb-2">Текущий вес (тара):</div>
        <div className="text-4xl font-bold text-black">
          {currentWeight ? formatWeight(currentWeight) : '---'}
        </div>
        {isConnected && (
          <button
            onClick={onGetWeight}
            disabled={isLoading}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-black disabled:bg-mono-400 transition-colors"
          >
            {isLoading ? 'Получение...' : '⚖️ Получить вес'}
          </button>
        )}
      </div>

      {/* Поиск черновика */}
      <div className="p-4 bg-white border border-mono-200 rounded-lg">
        <h3 className="text-lg font-semibold text-mono-900 mb-4">
          Найти черновик по номеру
        </h3>
        
        <div className="flex space-x-3">
          <input
            type="text"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value.toUpperCase())}
            placeholder="А123БВ777"
            className="flex-1 px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
          />
          <button
            onClick={() => findDraftByNumber(searchNumber)}
            disabled={!searchNumber.trim()}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black disabled:bg-mono-400 transition-colors"
          >
            🔍 Найти
          </button>
        </div>
      </div>

      {/* Выбранный черновик */}
      {selectedDraft && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            📋 Выбранный черновик
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="font-medium text-mono-700">Номер:</span>
              <div className="text-lg font-bold text-mono-900">{selectedDraft.vehicleNumber}</div>
            </div>
            <div>
              <span className="font-medium text-mono-700">Брутто:</span>
              <div className="text-lg font-bold text-mono-600">{formatWeight(selectedDraft.grossWeight)}</div>
            </div>
            <div>
              <span className="font-medium text-mono-700">Время въезда:</span>
              <div className="text-mono-900">{formatTimestamp(selectedDraft.grossTimestamp)}</div>
            </div>
            <div>
              <span className="font-medium text-mono-700">Оператор:</span>
              <div className="text-mono-900">{selectedDraft.operatorName}</div>
            </div>
          </div>

          {/* Поля для завершения */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Поставщик:
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="ООО Поставщик"
                  className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Получатель:
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="ООО Получатель"
                  className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Тип груза:
              </label>
              <input
                type="text"
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                placeholder="Песок, щебень, бетон..."
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Примечания:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительная информация..."
                rows={3}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              />
            </div>

            {/* Предварительный расчет */}
            {currentWeight && (
              <div className="p-3 bg-mono-50 border border-mono-200 rounded-lg">
                <div className="text-sm font-medium text-black mb-2">Предварительный расчет:</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-mono-700">Брутто:</span>
                    <div className="font-bold text-mono-600">{formatWeight(selectedDraft.grossWeight)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-mono-700">Тара:</span>
                    <div className="font-bold text-black">{formatWeight(currentWeight)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-mono-700">Нетто:</span>
                    <div className="font-bold text-purple-600">{formatWeight(calculateNetWeight(selectedDraft.grossWeight, currentWeight))}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={completeWeighing}
                disabled={!currentWeight || !isConnected}
                className="flex-1 px-6 py-3 bg-mono-600 text-white rounded-lg hover:bg-mono-700 disabled:bg-mono-400 transition-colors font-medium"
              >
                ✅ Обновить и сохранить
              </button>
              
              <button
                onClick={() => {
                  setSelectedDraft(null);
                  setSearchNumber('');
                  setSupplier('');
                  setRecipient('');
                  setCargoType('');
                  setNotes('');
                }}
                className="px-6 py-3 bg-mono-600 text-white rounded-lg hover:bg-mono-700 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список незавершенных черновиков */}
      {pendingDrafts.length > 0 && (
        <div className="p-4 bg-white border border-mono-200 rounded-lg">
          <h3 className="text-lg font-semibold text-mono-900 mb-4">
            📋 Ожидают завершения ({pendingDrafts.length})
          </h3>
          
          <div className="space-y-3">
            {pendingDrafts.map(draft => (
              <div key={draft.id} className="p-3 bg-mono-50 border border-mono-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="font-medium text-mono-700">Номер:</span>
                        <span className="ml-2 font-bold text-mono-900">{draft.vehicleNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium text-mono-700">Брутто:</span>
                        <span className="ml-2 font-bold text-mono-600">{formatWeight(draft.grossWeight)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-mono-700">Время въезда:</span>
                        <span className="ml-2 text-mono-900">{formatTimestamp(draft.grossTimestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSearchNumber(draft.vehicleNumber);
                      findDraftByNumber(draft.vehicleNumber);
                    }}
                    className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-black transition-colors"
                  >
                    Выбрать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Сообщения */}
      {error && (
        <div className="p-4 bg-mono-50 border border-mono-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-mono-600">❌ {error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-mono-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-mono-600">✅ {success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartureWeighing;
