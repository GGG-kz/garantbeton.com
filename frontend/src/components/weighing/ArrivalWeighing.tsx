import React, { useState, useEffect } from 'react';
import { WeighingDraft, CreateDraftRequest, formatWeight, formatTimestamp } from '../../types/weighing';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuthStore } from '../../stores/authStore';

interface ArrivalWeighingProps {
  currentWeight: number | null;
  onWeightChange: (weight: number) => void;
  isConnected: boolean;
  onConnect: () => void;
  onGetWeight: () => void;
  isLoading: boolean;
}

const ArrivalWeighing: React.FC<ArrivalWeighingProps> = ({
  currentWeight,
  onWeightChange,
  isConnected,
  onConnect,
  onGetWeight,
  isLoading
}) => {
  const { user } = useAuthStore();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drafts, setDrafts] = useLocalStorage<WeighingDraft[]>('weighingDrafts', []);
  const [activeDraft, setActiveDraft] = useState<WeighingDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Создание нового черновика
  const createDraft = () => {
    if (!vehicleNumber.trim()) {
      setError('Введите государственный номер');
      return;
    }

    if (!currentWeight) {
      setError('Получите вес перед созданием записи');
      return;
    }

    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    // Проверяем, нет ли уже черновика для этого номера
    const existingDraft = drafts.find(draft => 
      draft.vehicleNumber === vehicleNumber.trim() && draft.status === 'draft'
    );

    if (existingDraft) {
      setError('Для этого номера уже существует незавершенная запись');
      return;
    }

    const newDraft: WeighingDraft = {
      id: `draft_${Date.now()}`,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      grossWeight: currentWeight,
      grossTimestamp: new Date().toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.fullName || user.login || 'Оператор'
    };

    setDrafts([newDraft, ...drafts]);
    setActiveDraft(newDraft);
    setVehicleNumber('');
    setSuccess('Черновик создан успешно!');
  };

  // Сохранение черновика
  const saveDraft = () => {
    if (!activeDraft) {
      setError('Нет активного черновика для сохранения');
      return;
    }

    const updatedDrafts = drafts.map(draft => 
      draft.id === activeDraft.id 
        ? { ...draft, updatedAt: new Date().toISOString() }
        : draft
    );

    setDrafts(updatedDrafts);
    setActiveDraft(null);
    setSuccess('Черновик сохранен!');
  };

  // Удаление черновика
  const deleteDraft = (draftId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот черновик?')) {
      const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
      setDrafts(updatedDrafts);
      
      if (activeDraft?.id === draftId) {
        setActiveDraft(null);
      }
      
      setSuccess('Черновик удален!');
    }
  };

  // Продолжение работы с черновиком
  const continueDraft = (draft: WeighingDraft) => {
    setActiveDraft(draft);
    setVehicleNumber(draft.vehicleNumber);
    setSuccess('Черновик загружен для продолжения работы');
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-mono-900 mb-2">
          🚛 Въезд (Брутто)
        </h2>
        <p className="text-mono-600">
          Взвешивание машин при въезде на территорию
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
        <div className="text-sm text-black mb-2">Текущий вес:</div>
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

      {/* Создание нового черновика */}
      <div className="p-4 bg-white border border-mono-200 rounded-lg">
        <h3 className="text-lg font-semibold text-mono-900 mb-4">
          Создать новую запись
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Государственный номер:
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="А123БВ777"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              disabled={!!activeDraft}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={createDraft}
              disabled={!currentWeight || !vehicleNumber.trim() || !!activeDraft || !isConnected}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-mono-400 transition-colors"
            >
              📝 Добавить
            </button>
            
            {activeDraft && (
              <button
                onClick={saveDraft}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors"
              >
                💾 Сохранить (черновик)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Активный черновик */}
      {activeDraft && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            🚧 Активный черновик
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-mono-700">Номер:</span>
              <div className="text-lg font-bold text-mono-900">{activeDraft.vehicleNumber}</div>
            </div>
            <div>
              <span className="font-medium text-mono-700">Брутто:</span>
              <div className="text-lg font-bold text-mono-600">{formatWeight(activeDraft.grossWeight)}</div>
            </div>
            <div>
              <span className="font-medium text-mono-700">Время въезда:</span>
              <div className="text-mono-900">{formatTimestamp(activeDraft.grossTimestamp)}</div>
            </div>
            <div>
              <span className="font-medium text-mono-700">Оператор:</span>
              <div className="text-mono-900">{activeDraft.operatorName}</div>
            </div>
          </div>
        </div>
      )}

      {/* Список черновиков */}
      {drafts.filter(draft => draft.status === 'draft').length > 0 && (
        <div className="p-4 bg-white border border-mono-200 rounded-lg">
          <h3 className="text-lg font-semibold text-mono-900 mb-4">
            📋 Незавершенные записи ({drafts.filter(draft => draft.status === 'draft').length})
          </h3>
          
          <div className="space-y-3">
            {drafts
              .filter(draft => draft.status === 'draft')
              .map(draft => (
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
                          <span className="font-medium text-mono-700">Время:</span>
                          <span className="ml-2 text-mono-900">{formatTimestamp(draft.grossTimestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => continueDraft(draft)}
                        className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-black transition-colors"
                      >
                        Продолжить
                      </button>
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Сообщения */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-mono-600">❌ {error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-mono-600">✅ {success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArrivalWeighing;
