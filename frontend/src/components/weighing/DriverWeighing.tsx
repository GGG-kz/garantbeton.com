import React, { useState, useEffect } from 'react';
import { WeighingDraft, formatWeight, formatTimestamp, calculateNetWeight } from '../../types/weighing';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuthStore } from '../../stores/authStore';

interface DriverWeighingProps {
  currentWeight: number | null;
  onWeightChange: (weight: number) => void;
  isConnected: boolean;
  onConnect: () => void;
  onGetWeight: () => void;
  isLoading: boolean;
}

type DriverMode = 'arrival' | 'departure';

const DriverWeighing: React.FC<DriverWeighingProps> = ({
  currentWeight,
  onWeightChange,
  isConnected,
  onConnect,
  onGetWeight,
  isLoading
}) => {
  const { user } = useAuthStore();
  const [mode, setMode] = useState<DriverMode>('arrival');
  const [drafts, setDrafts] = useLocalStorage<WeighingDraft[]>('driverWeighingDrafts', []);
  const [activeDraft, setActiveDraft] = useState<WeighingDraft | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [searchNumber, setSearchNumber] = useState('');
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

  // Создание черновика (въезд)
  const createArrivalDraft = () => {
    if (!vehicleNumber.trim()) {
      setError('Введите номер вашего автомобиля');
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
      setError('Для вашего автомобиля уже есть незавершенная запись');
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
      operatorName: user.fullName || user.login || 'Водитель'
    };

    setDrafts([newDraft, ...drafts]);
    setActiveDraft(newDraft);
    setVehicleNumber('');
    setSuccess('✅ Запись въезда создана! Можете ехать на разгрузку.');
  };

  // Поиск черновика (выезд)
  const findDepartureDraft = () => {
    if (!searchNumber.trim()) {
      setError('Введите номер вашего автомобиля');
      return;
    }

    const foundDraft = drafts.find(draft => 
      draft.vehicleNumber === searchNumber.trim().toUpperCase() && draft.status === 'draft'
    );
    
    if (foundDraft) {
      setActiveDraft(foundDraft);
      setSuccess('✅ Ваш автомобиль найден! Можете взвешиваться на выезде.');
    } else {
      setError('❌ Запись въезда не найдена. Проверьте номер автомобиля.');
    }
  };

  // Завершение взвешивания (выезд)
  const completeDeparture = () => {
    if (!activeDraft) {
      setError('Выберите запись для завершения');
      return;
    }

    if (!currentWeight) {
      setError('Получите вес перед завершением');
      return;
    }

    const netWeight = calculateNetWeight(activeDraft.grossWeight, currentWeight);

    const completedDraft: WeighingDraft = {
      ...activeDraft,
      tareWeight: currentWeight,
      tareTimestamp: new Date().toISOString(),
      netWeight: netWeight,
      status: 'completed',
      updatedAt: new Date().toISOString()
    };

    const updatedDrafts = drafts.map(draft => 
      draft.id === activeDraft.id ? completedDraft : draft
    );

    setDrafts(updatedDrafts);
    setActiveDraft(null);
    setSearchNumber('');
    setSuccess('🎉 Взвешивание завершено! Можете покинуть территорию.');
  };

  // Получение статистики водителя
  const driverStats = {
    totalTrips: drafts.filter(d => d.status === 'completed').length,
    pendingTrips: drafts.filter(d => d.status === 'draft').length,
    totalWeight: drafts.filter(d => d.status === 'completed' && d.netWeight).reduce((sum, d) => sum + (d.netWeight || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-mono-900 mb-2">
          🚛 Взвешивание для водителей
        </h2>
        <p className="text-mono-600">
          Быстрое взвешивание при въезде и выезде
        </p>
      </div>

      {/* Статистика водителя */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-mono-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-mono-600">{driverStats.totalTrips}</div>
          <div className="text-sm text-mono-700">Завершено</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-mono-600">{driverStats.pendingTrips}</div>
          <div className="text-sm text-yellow-700">В процессе</div>
        </div>
        <div className="bg-mono-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-black">{driverStats.totalWeight.toFixed(0)}</div>
          <div className="text-sm text-black">кг всего</div>
        </div>
      </div>

      {/* Переключатель режимов */}
      <div className="flex space-x-1 bg-mono-100 p-1 rounded-lg">
        <button
          onClick={() => setMode('arrival')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            mode === 'arrival'
              ? 'bg-white text-black shadow-sm'
              : 'text-mono-600 hover:text-mono-900'
          }`}
        >
          🚛 Въезд
        </button>
        <button
          onClick={() => setMode('departure')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            mode === 'departure'
              ? 'bg-white text-black shadow-sm'
              : 'text-mono-600 hover:text-mono-900'
          }`}
        >
          🚚 Выезд
        </button>
      </div>

      {/* Статус весов */}
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
            className="mt-2 w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-black disabled:bg-mono-400 transition-colors"
          >
            {isLoading ? 'Подключение...' : 'Подключить к весам'}
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
            className="mt-4 w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-black disabled:bg-mono-400 transition-colors font-medium"
          >
            {isLoading ? 'Получение...' : '⚖️ Получить вес'}
          </button>
        )}
      </div>

      {/* Режим въезда */}
      {mode === 'arrival' && (
        <div className="p-4 bg-mono-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-mono-900 mb-4">
            🚛 Въезд на территорию
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Номер вашего автомобиля:
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="А123БВ777"
                className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                disabled={!!activeDraft}
              />
            </div>

            <button
              onClick={createArrivalDraft}
              disabled={!currentWeight || !vehicleNumber.trim() || !!activeDraft || !isConnected}
              className="w-full px-6 py-4 bg-mono-600 text-white rounded-lg hover:bg-mono-700 disabled:bg-mono-400 transition-colors font-medium text-lg"
            >
              📝 Зафиксировать въезд
            </button>

            {activeDraft && (
              <div className="p-3 bg-white border border-green-300 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-mono-800 mb-2">
                    ✅ Въезд зафиксирован!
                  </div>
                  <div className="text-sm text-mono-700">
                    Номер: <span className="font-bold">{activeDraft.vehicleNumber}</span>
                  </div>
                  <div className="text-sm text-mono-700">
                    Вес: <span className="font-bold">{formatWeight(activeDraft.grossWeight)}</span>
                  </div>
                  <div className="text-sm text-mono-700">
                    Время: <span className="font-bold">{formatTimestamp(activeDraft.grossTimestamp)}</span>
                  </div>
                  <div className="mt-3 text-sm text-mono-600 font-medium">
                    Можете ехать на разгрузку
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Режим выезда */}
      {mode === 'departure' && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">
            🚚 Выезд с территории
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Номер вашего автомобиля:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value.toUpperCase())}
                  placeholder="А123БВ777"
                  className="flex-1 px-4 py-3 border border-mono-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                />
                <button
                  onClick={findDepartureDraft}
                  disabled={!searchNumber.trim()}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-mono-400 transition-colors font-medium"
                >
                  🔍 Найти
                </button>
              </div>
            </div>

            {activeDraft && (
              <div className="p-4 bg-white border border-orange-300 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-lg font-bold text-orange-800 mb-2">
                    📋 Ваш автомобиль найден
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-mono-700">Номер:</span>
                      <div className="font-bold text-mono-900">{activeDraft.vehicleNumber}</div>
                    </div>
                    <div>
                      <span className="font-medium text-mono-700">Въезд:</span>
                      <div className="font-bold text-mono-600">{formatWeight(activeDraft.grossWeight)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-mono-700">Время въезда:</span>
                      <div className="text-mono-900">{formatTimestamp(activeDraft.grossTimestamp)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-mono-700">Текущий вес:</span>
                      <div className="font-bold text-black">
                        {currentWeight ? formatWeight(currentWeight) : '---'}
                      </div>
                    </div>
                  </div>

                  {currentWeight && (
                    <div className="mt-4 p-3 bg-mono-50 border border-mono-200 rounded-lg">
                      <div className="text-sm font-medium text-black mb-2">Расчет:</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-mono-700">Въезд:</span>
                          <div className="font-bold text-mono-600">{formatWeight(activeDraft.grossWeight)}</div>
                        </div>
                        <div>
                          <span className="font-medium text-mono-700">Выезд:</span>
                          <div className="font-bold text-black">{formatWeight(currentWeight)}</div>
                        </div>
                        <div>
                          <span className="font-medium text-mono-700">Груз:</span>
                          <div className="font-bold text-purple-600">
                            {formatWeight(calculateNetWeight(activeDraft.grossWeight, currentWeight))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={completeDeparture}
                    disabled={!currentWeight || !isConnected}
                    className="mt-4 w-full px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-mono-400 transition-colors font-medium text-lg"
                  >
                    ✅ Завершить взвешивание
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* История водителя */}
      {drafts.length > 0 && (
        <div className="p-4 bg-white border border-mono-200 rounded-lg">
          <h3 className="text-lg font-semibold text-mono-900 mb-4">
            📋 История взвешиваний
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {drafts
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10)
              .map(draft => (
                <div key={draft.id} className={`p-3 rounded-lg border ${
                  draft.status === 'completed' 
                    ? 'bg-mono-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="font-medium text-mono-700">Номер:</span>
                        <span className="ml-1 font-bold">{draft.vehicleNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium text-mono-700">Въезд:</span>
                        <span className="ml-1 font-bold text-mono-600">{formatWeight(draft.grossWeight)}</span>
                      </div>
                      {draft.tareWeight && (
                        <div>
                          <span className="font-medium text-mono-700">Выезд:</span>
                          <span className="ml-1 font-bold text-black">{formatWeight(draft.tareWeight)}</span>
                        </div>
                      )}
                      {draft.netWeight && (
                        <div>
                          <span className="font-medium text-mono-700">Груз:</span>
                          <span className="ml-1 font-bold text-purple-600">{formatWeight(draft.netWeight)}</span>
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      draft.status === 'completed' 
                        ? 'bg-mono-100 text-mono-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {draft.status === 'completed' ? 'Завершено' : 'В процессе'}
                    </div>
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
            <span className="text-mono-600 font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-mono-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-mono-600 font-medium">{success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverWeighing;
