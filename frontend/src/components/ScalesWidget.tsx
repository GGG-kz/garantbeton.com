import React, { useState, useEffect } from 'react';
import { Weight, Plug, PlugZap, AlertCircle, CheckCircle } from 'lucide-react';

interface ScalesWidgetProps {
  onWeightChange?: (weight: number) => void;
  className?: string;
  warehouseId?: string;
  warehouseName?: string;
  comPort?: string;
  showAdvanced?: boolean;
  autoConnect?: boolean; // Новый пропс для управления автоматическим подключением
}

const ScalesWidget: React.FC<ScalesWidgetProps> = ({ 
  onWeightChange, 
  className = '', 
  warehouseId,
  warehouseName,
  comPort,
  showAdvanced = false,
  autoConnect = false 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [weight, setWeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Настройки по умолчанию для ваших весов
  const defaultSettings = {
    port: comPort || 'COM3',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none' as const
  };

  // Проверяем поддержку Web Serial API
  const isSerialSupported = () => {
    return 'serial' in navigator;
  };

  // Подключение к весам
  const connectToScales = async () => {
    if (!isSerialSupported()) {
      setError('Web Serial API не поддерживается в этом браузере');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Запрос доступа к порту
      const port = await (navigator as any).serial.requestPort({
        filters: [{ usbVendorId: 0x1a86 }] // ID для большинства USB-to-Serial адаптеров
      });

      // Открытие порта с настройками по умолчанию
      await port.open({
        baudRate: defaultSettings.baudRate,
        dataBits: defaultSettings.dataBits,
        stopBits: defaultSettings.stopBits,
        parity: defaultSettings.parity
      });

      setIsConnected(true);
      
      // Начинаем чтение данных
      startReading(port);

    } catch (err) {
      setError(`Ошибка подключения: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Отключение от весов
  const disconnectFromScales = async () => {
    try {
      setIsConnected(false);
      setWeight(null);
      setError(null);
    } catch (err) {
      console.error('Ошибка отключения:', err);
    }
  };

  // Чтение данных с весов
  const startReading = async (port: any) => {
    const reader = port.readable.getReader();
    
    try {
      while (isConnected) {
        const { value, done } = await reader.read();
        
        if (done) break;
        
        // Преобразуем данные в строку
        const data = new TextDecoder().decode(value);
        
        // Парсим вес (предполагаем формат "WEIGHT: 123.45 kg")
        const weightMatch = data.match(/(\d+\.?\d*)/);
        if (weightMatch) {
          const newWeight = parseFloat(weightMatch[1]);
          setWeight(newWeight);
          onWeightChange?.(newWeight);
        }
      }
    } catch (err) {
      setError('Ошибка чтения данных с весов');
      console.error('Ошибка чтения:', err);
    } finally {
      reader.releaseLock();
    }
  };

  // Получение веса по запросу
  const getWeight = async () => {
    if (!isConnected) {
      setError('Сначала подключитесь к весам');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Отправляем команду запроса веса (зависит от модели весов)
      // Обычно это команда "W" или "P"
      
    } catch (err) {
      setError('Ошибка получения веса');
    } finally {
      setIsLoading(false);
    }
  };

  // Автоматическое подключение при загрузке (если порт уже был выбран)
  useEffect(() => {
    // Можно добавить логику для автоматического переподключения
  }, []);

  return (
    <div className={`p-4 bg-white border border-mono-200 rounded-lg shadow-sm ${className}`}>
      {/* Отладочная информация */}
      <div className="mb-2 p-2 bg-mono-50 border border-mono-200 rounded text-xs text-mono-600">
        🔧 ОТЛАДКА: ScalesWidget загружен успешно!
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Weight className="h-5 w-5 text-mono-600" />
          <div>
            <h3 className="font-medium text-black">
              ⚖️ Весы {warehouseName ? `(${warehouseName})` : ''}
            </h3>
            {comPort && (
              <p className="text-xs text-mono-500">
                Порт: {comPort} • 9600 bps, 8N1
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-1 text-mono-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Подключено</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-mono-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Отключено</span>
            </div>
          )}
        </div>
      </div>

      {/* Настройки */}
      <div className="mb-4 p-3 bg-mono-50 rounded-lg">
        <div className="text-sm text-mono-600 mb-2">Настройки подключения:</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-mono-500">
          <div>Порт: {defaultSettings.port}</div>
          <div>Скорость: {defaultSettings.baudRate} bps</div>
          <div>Данные: {defaultSettings.dataBits}N{defaultSettings.stopBits}</div>
          <div>Четность: {defaultSettings.parity}</div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex space-x-2 mb-4">
        {!isConnected ? (
          <button
            onClick={connectToScales}
            disabled={isLoading || !isSerialSupported()}
            className="flex items-center space-x-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-mono-800 disabled:bg-mono-400 disabled:cursor-not-allowed text-sm"
          >
            <Plug className="h-4 w-4" />
            <span>{isLoading ? 'Подключение...' : 'Подключить'}</span>
          </button>
        ) : (
          <button
            onClick={disconnectFromScales}
            className="flex items-center space-x-2 px-3 py-2 bg-mono-800 text-white rounded-lg hover:bg-black text-sm"
          >
            <PlugZap className="h-4 w-4" />
            <span>Отключить</span>
          </button>
        )}
        
        {isConnected && (
          <button
            onClick={getWeight}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-mono-700 text-white rounded-lg hover:bg-mono-800 disabled:bg-mono-400 text-sm"
          >
            <Weight className="h-4 w-4" />
            <span>{isLoading ? 'Взвешивание...' : 'Получить вес'}</span>
          </button>
        )}
      </div>

      {/* Отображение веса */}
      {weight !== null && (
        <div className="p-3 bg-mono-100 border border-mono-200 rounded-lg">
          <div className="text-sm text-mono-600 mb-1">Текущий вес:</div>
          <div className="text-2xl font-bold text-black">{weight.toFixed(2)} кг</div>
        </div>
      )}

      {/* Отображение ошибки */}
      {error && (
        <div className="p-3 bg-mono-100 border border-mono-300 rounded-lg">
          <div className="flex items-center space-x-2 text-mono-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Предупреждение о поддержке браузера */}
      {!isSerialSupported() && (
        <div className="p-3 bg-mono-100 border border-mono-300 rounded-lg">
          <div className="flex items-center space-x-2 text-mono-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Web Serial API не поддерживается. Используйте Chrome/Edge для работы с COM-портами.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScalesWidget;
