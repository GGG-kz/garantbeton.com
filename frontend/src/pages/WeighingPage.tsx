import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types/auth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { WeighingDraft, WeighingStats } from '../types/weighing';
import ArrivalWeighing from '../components/weighing/ArrivalWeighing';
import DepartureWeighing from '../components/weighing/DepartureWeighing';

type WeighingMode = 'arrival' | 'departure';

const WeighingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<WeighingMode>('arrival');
  const [drafts, setDrafts] = useLocalStorage<WeighingDraft[]>('weighingDrafts', []);
  
  // Состояние весов
  const [isConnected, setIsConnected] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем права доступа
  useEffect(() => {
    if (user && ![UserRole.ADMIN, UserRole.DEVELOPER, UserRole.DISPATCHER, UserRole.OPERATOR].includes(user.role)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Статистика
  const stats: WeighingStats = {
    totalDrafts: drafts.length,
    completedWeighings: drafts.filter(d => d.status === 'completed').length,
    pendingDrafts: drafts.filter(d => d.status === 'draft').length,
    totalWeight: drafts.filter(d => d.status === 'completed' && d.netWeight).reduce((sum, d) => sum + (d.netWeight || 0), 0),
    averageWeight: 0
  };

  if (stats.completedWeighings > 0) {
    stats.averageWeight = stats.totalWeight / stats.completedWeighings;
  }

  // Подключение к весам
  const connectToScales = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Здесь будет реальное подключение к весам
      // Пока что симулируем подключение
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
    } catch (err) {
      setError(`Ошибка подключения: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Получение веса с реальных весов
  const getWeight = async () => {
    if (!isConnected) {
      setError('Нет подключения к весам');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Реализовать реальное получение веса с весов
      // await getWeightFromScales()
      setError('Функция получения веса будет реализована при подключении к реальным весам');
    } catch (err) {
      setError(`Ошибка получения веса: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-mono-900">Не авторизован</h1>
          <p className="text-mono-600 mt-2">Пожалуйста, войдите в систему</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 bg-mono-600 text-white rounded-lg hover:bg-mono-700 transition-colors"
              >
                ← Назад к Dashboard
              </button>
              
              <h1 className="text-2xl font-bold text-mono-900">
                ⚖️ Система взвешивания
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-mono-600">
                Оператор: <span className="font-medium">{user.fullName || user.login}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Переключатель режимов */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-mono-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setMode('arrival')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                mode === 'arrival'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-mono-600 hover:text-mono-900'
              }`}
            >
              🚛 Въезд (Брутто)
            </button>
            <button
              onClick={() => setMode('departure')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                mode === 'departure'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-mono-600 hover:text-mono-900'
              }`}
            >
              🚚 Выезд (Тара)
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-mono-100 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-mono-500">Всего записей</div>
                <div className="text-2xl font-bold text-mono-900">{stats.totalDrafts}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-mono-100 rounded-lg flex items-center justify-center">
                  <span className="text-mono-600 font-bold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-mono-500">Завершено</div>
                <div className="text-2xl font-bold text-mono-900">{stats.completedWeighings}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-mono-600 font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-mono-500">В процессе</div>
                <div className="text-2xl font-bold text-mono-900">{stats.pendingDrafts}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-mono-100 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold">⚖️</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-mono-500">Общий вес</div>
                <div className="text-2xl font-bold text-mono-900">
                  {stats.totalWeight.toFixed(0)} кг
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {mode === 'arrival' ? (
              <ArrivalWeighing
                currentWeight={currentWeight}
                onWeightChange={setCurrentWeight}
                isConnected={isConnected}
                onConnect={connectToScales}
                onGetWeight={getWeight}
                isLoading={isLoading}
              />
            ) : (
              <DepartureWeighing
                currentWeight={currentWeight}
                onWeightChange={setCurrentWeight}
                isConnected={isConnected}
                onConnect={connectToScales}
                onGetWeight={getWeight}
                isLoading={isLoading}
              />
            )}

            {/* Общие ошибки */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-mono-600">❌ {error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Инструкция */}
        <div className="mt-8 bg-mono-50 border border-mono-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            📋 Инструкция по процессу взвешивания
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-black mb-2">🚛 Въезд (Брутто):</h4>
              <ol className="text-sm text-black space-y-1 list-decimal list-inside">
                <li>Нажать «Добавить» → указать гос. номер</li>
                <li>Нажать «БРУТТО» → фиксируются вес + дата/время</li>
                <li>Нажать «Сохранить (черновик)»</li>
                <li>Повторить для других машин</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-black mb-2">🚚 Выезд (Тара):</h4>
              <ol className="text-sm text-black space-y-1 list-decimal list-inside">
                <li>Открыть черновик по номеру</li>
                <li>Нажать «ТАРА» → фиксируются вес + дата/время</li>
                <li>Заполнить: поставщик, получатель, груз</li>
                <li>Нетто считается автоматически: брутто – тара</li>
                <li>Нажать «Обновить и сохранить»</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeighingPage;
