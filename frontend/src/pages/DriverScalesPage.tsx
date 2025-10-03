import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types/auth';
import DriverWeighing from '../components/weighing/DriverWeighing';

interface WeighingRecord {
  id: string;
  timestamp: Date;
  weight: number;
  driver: string;
  vehicle: string;
  material: string;
  notes?: string;
}

const DriverScalesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scalesServerUrl, setScalesServerUrl] = useState('https://your-cloud-server.com:3001');
  const [connectionType, setConnectionType] = useState<'local' | 'cloud'>('cloud');
  const [isConnected, setIsConnected] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weighingHistory, setWeighingHistory] = useState<WeighingRecord[]>([]);
  
  // Поля для записи взвешивания
  const [driverName, setDriverName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [notes, setNotes] = useState('');
  const [wifiStatus, setWifiStatus] = useState<'checking' | 'wifi' | 'mobile' | 'offline'>('checking');
  const [interfaceMode, setInterfaceMode] = useState<'simple' | 'advanced'>('simple');

  // Проверяем тип подключения
  useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        // Проверяем доступность локального сервера (Wi-Fi)
        fetch('http://192.168.1.100:8080/status', { 
          method: 'HEAD',
          mode: 'no-cors'
        }).then(() => {
          setWifiStatus('wifi');
          setConnectionType('local');
          setScalesServerUrl('http://192.168.1.100:8080');
        }).catch(() => {
          // Если локальный сервер недоступен, используем облачный
          setWifiStatus('mobile');
          setConnectionType('cloud');
          setScalesServerUrl('https://your-cloud-server.com:3001');
        });
      } else {
        setWifiStatus('offline');
      }
    };

    checkConnection();
    
    // Проверяем каждые 30 секунд
    const interval = setInterval(checkConnection, 30000);
    
    // Слушаем изменения подключения
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Проверяем, что пользователь - водитель
  useEffect(() => {
    if (user && user.role !== UserRole.DRIVER) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Подключение к серверу весов
  const connectToScales = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Определяем правильный endpoint в зависимости от типа подключения
      const endpoint = connectionType === 'cloud' ? '/cloud/status' : '/status';
      const response = await fetch(`${scalesServerUrl}${endpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.scales_connected || data.local_server_status === 'online');
        if (data.last_weight !== null) {
          setCurrentWeight(data.last_weight);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(`Ошибка подключения: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Получение веса
  const getWeight = async () => {
    if (!isConnected) {
      setError('Нет подключения к весам');
      return;
    }

    setIsLoading(true);
    try {
      // Определяем правильный endpoint в зависимости от типа подключения
      const endpoint = connectionType === 'cloud' ? '/cloud/weight' : '/weight';
      const response = await fetch(`${scalesServerUrl}${endpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        setCurrentWeight(data.value);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(`Ошибка получения веса: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Обнуление весов
  const tareScales = async () => {
    if (!isConnected) {
      setError('Нет подключения к весам');
      return;
    }

    try {
      // Определяем правильный endpoint в зависимости от типа подключения
      const endpoint = connectionType === 'cloud' ? '/cloud/tare' : '/tare';
      const response = await fetch(`${scalesServerUrl}${endpoint}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setCurrentWeight(0);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(`Ошибка обнуления: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    }
  };

  // Сохранение результата взвешивания
  const saveWeighing = () => {
    if (!currentWeight || !driverName || !vehicleNumber || !materialType) {
      setError('Заполните все обязательные поля');
      return;
    }

    const record: WeighingRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      weight: currentWeight,
      driver: driverName,
      vehicle: vehicleNumber,
      material: materialType,
      notes: notes || undefined
    };

    setWeighingHistory(prev => [record, ...prev]);
    
    // Сохраняем в localStorage
    const existingRecords = JSON.parse(localStorage.getItem('driverWeighingHistory') || '[]');
    existingRecords.unshift(record);
    localStorage.setItem('driverWeighingHistory', JSON.stringify(existingRecords));

    // Очищаем форму
    setDriverName('');
    setVehicleNumber('');
    setMaterialType('');
    setNotes('');
    
    alert(`✅ Взвешивание сохранено!\nВес: ${currentWeight} кг\nВодитель: ${driverName}\nТранспорт: ${vehicleNumber}\nМатериал: ${materialType}`);
  };

  // Загрузка истории из localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('driverWeighingHistory');
    if (savedHistory) {
      try {
        const records = JSON.parse(savedHistory);
        setWeighingHistory(records.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp)
        })));
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-mono-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 inline-flex items-center px-4 py-2 bg-mono-600 text-white rounded-lg hover:bg-mono-700 transition-colors"
          >
            ← Назад к Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-mono-900 mb-2">
            ⚖️ Взвешивание для водителей
          </h1>
          <p className="text-mono-600 mb-4">
            Самостоятельное взвешивание материалов в ночное время
          </p>

          {/* Переключатель интерфейса */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-mono-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setInterfaceMode('simple')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  interfaceMode === 'simple'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-mono-600 hover:text-mono-900'
                }`}
              >
                🚛 Простое взвешивание
              </button>
              <button
                onClick={() => setInterfaceMode('advanced')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  interfaceMode === 'advanced'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-mono-600 hover:text-mono-900'
                }`}
              >
                📋 Подробные записи
              </button>
            </div>
          </div>
          
          {/* Индикатор Wi-Fi статуса */}
          <div className="mb-4 p-3 rounded-lg border">
            {wifiStatus === 'checking' && (
              <div className="flex items-center space-x-2 text-mono-600">
                <div className="w-3 h-3 bg-mono-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Проверка подключения...</span>
              </div>
            )}
            {wifiStatus === 'wifi' && (
              <div className="flex items-center space-x-2 text-mono-600">
                <div className="w-3 h-3 bg-mono-500 rounded-full"></div>
                <span className="text-sm">✅ Wi-Fi подключение активно</span>
              </div>
            )}
            {wifiStatus === 'mobile' && (
              <div className="flex items-center space-x-2 text-mono-600">
                <div className="w-3 h-3 bg-mono-500 rounded-full"></div>
                <span className="text-sm">⚠️ Обнаружено мобильное подключение</span>
              </div>
            )}
            {wifiStatus === 'offline' && (
              <div className="flex items-center space-x-2 text-mono-600">
                <div className="w-3 h-3 bg-mono-500 rounded-full"></div>
                <span className="text-sm">❌ Нет подключения к интернету</span>
              </div>
            )}
            
            {wifiStatus === 'mobile' && connectionType === 'cloud' && (
              <div className="mt-2 p-2 bg-mono-50 border border-mono-200 rounded text-xs text-mono-600">
                <strong>ИНФОРМАЦИЯ:</strong> Используется облачное подключение через мобильный интернет. Данные передаются через защищенный сервер.
              </div>
            )}
          </div>
        </div>

        {/* Основной контент */}
        {interfaceMode === 'simple' ? (
          <DriverWeighing
            currentWeight={currentWeight}
            onWeightChange={setCurrentWeight}
            isConnected={isConnected}
            onConnect={connectToScales}
            onGetWeight={getWeight}
            isLoading={isLoading}
          />
        ) : (
          <>
            {/* Карточка весов */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl">
                ⚖️
              </div>
              <div>
                <h2 className="text-xl font-bold text-mono-900">Весы склада</h2>
                <p className="text-mono-600">Автоматическое подключение к серверу весов</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-mono-500' : 'bg-mono-700'}`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-mono-600' : 'text-mono-700'}`}>
                {isConnected ? 'Подключено' : 'Отключено'}
              </span>
            </div>
          </div>

          {/* Настройки подключения */}
          <div className="mb-6 p-4 bg-mono-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-mono-700">
                Подключение к весам:
              </label>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  connectionType === 'local' 
                    ? 'bg-mono-100 text-mono-700' 
                    : 'bg-mono-200 text-mono-800'
                }`}>
                  {connectionType === 'local' ? 'Wi-Fi (локальное)' : 'Облачное (мобильный интернет)'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={scalesServerUrl}
                  onChange={(e) => setScalesServerUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                  placeholder={connectionType === 'local' ? 'http://192.168.1.100:8080' : 'https://your-cloud-server.com:3001'}
                />
                <button
                  onClick={connectToScales}
                  disabled={isLoading}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-mono-800 disabled:bg-mono-400 transition-colors"
                >
                  {isLoading ? 'Подключение...' : 'Подключить'}
                </button>
              </div>
              
              <div className="text-xs text-mono-500">
                {connectionType === 'local' ? (
                  <>Локальное подключение через Wi-Fi сеть склада</>
                ) : (
                  <>Облачное подключение через мобильный интернет</>
                )}
              </div>
            </div>
          </div>

          {/* Отображение веса */}
          <div className="mb-6 p-6 bg-mono-50 border border-mono-200 rounded-lg text-center">
            <div className="text-sm text-black mb-2">Текущий вес:</div>
            <div className="text-4xl font-bold text-black">
              {currentWeight !== null ? `${currentWeight.toFixed(2)} кг` : '---'}
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={getWeight}
              disabled={!isConnected || isLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-mono-600 text-white rounded-lg hover:bg-mono-700 disabled:bg-mono-400 transition-colors"
            >
              <span>⚖️</span>
              <span>Получить вес</span>
            </button>
            
            <button
              onClick={tareScales}
              disabled={!isConnected || isLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-mono-400 transition-colors"
            >
              <span>🔄</span>
              <span>Обнулить</span>
            </button>
          </div>

          {/* Ошибки */}
          {error && (
            <div className="mb-6 p-4 bg-mono-50 border border-mono-200 rounded-lg">
              <div className="flex items-center space-x-2 text-mono-600">
                <span>⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Форма записи взвешивания */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-mono-900 mb-4">📝 Записать взвешивание</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Имя водителя *
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                placeholder="Введите ваше имя"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Номер транспорта *
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                placeholder="А123БВ 777"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Тип материала *
              </label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              >
                <option value="">Выберите материал</option>
                <option value="песок">Песок</option>
                <option value="щебень">Щебень</option>
                <option value="цемент">Цемент</option>
                <option value="бетон">Бетон</option>
                <option value="другое">Другое</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Примечания
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                placeholder="Дополнительная информация"
              />
            </div>
          </div>
          
          <button
            onClick={saveWeighing}
            disabled={!currentWeight || !driverName || !vehicleNumber || !materialType}
            className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-black disabled:bg-mono-400 transition-colors"
          >
            💾 Сохранить взвешивание
          </button>
        </div>

        {/* История взвешиваний */}
        {weighingHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-mono-900 mb-4">📋 История взвешиваний</h3>
            
            <div className="space-y-3">
              {weighingHistory.slice(0, 5).map((record) => (
                <div key={record.id} className="p-3 bg-mono-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-mono-900">
                        {record.weight.toFixed(2)} кг - {record.material}
                      </div>
                      <div className="text-sm text-mono-600">
                        {record.driver} • {record.vehicle}
                      </div>
                      <div className="text-xs text-mono-500">
                        {record.timestamp.toLocaleString('ru-RU')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-black">
                        #{record.id.slice(-6)}
                      </div>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="mt-2 text-sm text-mono-600 italic">
                      "{record.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverScalesPage;
