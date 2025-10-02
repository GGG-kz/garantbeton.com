import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ScalesModel, PRESET_SCALES_MODELS } from '../types/scalesModels';
import Modal from '../components/Modal';
import ViewToggle from '../components/ViewToggle';

const ScalesModelsPage: React.FC = () => {
  const [scalesModels, setScalesModels] = useLocalStorage<ScalesModel[]>('scalesModels', PRESET_SCALES_MODELS);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<ScalesModel | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState('');

  const manufacturers = Array.from(new Set(scalesModels.map(model => model.manufacturer)));

  const filteredModels = scalesModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesManufacturer = !filterManufacturer || model.manufacturer === filterManufacturer;
    return matchesSearch && matchesManufacturer;
  });

  const handleAdd = () => {
    setEditingModel(null);
    setShowModal(true);
  };

  const handleEdit = (model: ScalesModel) => {
    setEditingModel(model);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту модель весов?')) {
      setScalesModels(scalesModels.filter(model => model.id !== id));
    }
  };

  const handleDuplicate = (model: ScalesModel) => {
    const newModel: ScalesModel = {
      ...model,
      id: `${model.id}-copy-${Date.now()}`,
      name: `${model.name} (копия)`,
      model: `${model.model}-copy`
    };
    setScalesModels([...scalesModels, newModel]);
  };

  const handleSave = (modelData: Partial<ScalesModel>) => {
    if (editingModel) {
      // Редактирование
      setScalesModels(scalesModels.map(model => 
        model.id === editingModel.id ? { ...model, ...modelData } : model
      ));
    } else {
      // Добавление
      const newModel: ScalesModel = {
        id: `model-${Date.now()}`,
        name: '',
        manufacturer: '',
        model: '',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        commands: {
          getWeight: '',
          tare: '',
          zero: '',
          calibration: '',
          status: '',
          reset: ''
        },
        autoSettings: {
          autoConnect: true,
          autoTare: true,
          autoZero: false,
          pollingInterval: 1000,
          timeout: 3000,
          retryAttempts: 3,
          autoReconnect: true,
          connectionDelay: 1000
        },
        ...modelData
      } as ScalesModel;
      setScalesModels([...scalesModels, newModel]);
    }
    setShowModal(false);
    setEditingModel(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">Модели весов</h1>
          <p className="text-mono-600 mt-1">
            Управление моделями весов и их настройками
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
        >
          Добавить модель
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Поиск по названию, производителю или модели..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            />
          </div>
          <div className="min-w-48">
            <select
              value={filterManufacturer}
              onChange={(e) => setFilterManufacturer(e.target.value)}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            >
              <option value="">Все производители</option>
              {manufacturers.map(manufacturer => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>
          </div>
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-mono-100 rounded-lg">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">Всего моделей</p>
              <p className="text-2xl font-bold text-mono-900">{scalesModels.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-mono-100 rounded-lg">
              <svg className="w-6 h-6 text-mono-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">Производителей</p>
              <p className="text-2xl font-bold text-mono-900">{manufacturers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">С автоподключением</p>
              <p className="text-2xl font-bold text-mono-900">
                {scalesModels.filter(m => m.autoSettings.autoConnect).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-mono-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Модель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Производитель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Настройки
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Автонастройки
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-mono-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-mono-900">{model.name}</div>
                        <div className="text-sm text-mono-500">{model.model}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-mono-900">{model.manufacturer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-mono-900">
                        {model.baudRate} bps, {model.dataBits}N{model.stopBits}, {model.parity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {model.autoSettings.autoConnect && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mono-100 text-green-800">
                            Автоподключение
                          </span>
                        )}
                        {model.autoSettings.autoTare && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mono-100 text-black">
                            Автотарирование
                          </span>
                        )}
                        {model.autoSettings.autoZero && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Автообнуление
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(model)}
                          className="text-black hover:text-black"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDuplicate(model)}
                          className="text-mono-600 hover:text-green-900"
                        >
                          Дублировать
                        </button>
                        <button
                          onClick={() => handleDelete(model.id)}
                          className="text-mono-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Карточки */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div key={model.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mono-900">{model.name}</h3>
                  <p className="text-sm text-mono-600">{model.manufacturer} {model.model}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(model)}
                    className="p-2 text-black hover:text-black hover:bg-mono-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDuplicate(model)}
                    className="p-2 text-mono-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="p-2 text-mono-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-mono-700">Настройки подключения</p>
                  <p className="text-sm text-mono-600">
                    {model.baudRate} bps, {model.dataBits}N{model.stopBits}, {model.parity}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-mono-700">Автонастройки</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {model.autoSettings.autoConnect && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mono-100 text-green-800">
                        Автоподключение
                      </span>
                    )}
                    {model.autoSettings.autoTare && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mono-100 text-black">
                        Автотарирование
                      </span>
                    )}
                    {model.autoSettings.autoZero && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Автообнуление
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingModel(null);
        }}
        title={editingModel ? 'Редактировать модель весов' : 'Добавить модель весов'}
      >
        <ScalesModelForm
          model={editingModel}
          onSave={handleSave}
          onCancel={() => {
            setShowModal(false);
            setEditingModel(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Форма для модели весов
const ScalesModelForm: React.FC<{
  model: ScalesModel | null;
  onSave: (data: Partial<ScalesModel>) => void;
  onCancel: () => void;
}> = ({ model, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ScalesModel>>(
    model || {
      name: '',
      manufacturer: '',
      model: '',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      commands: {
        getWeight: '',
        tare: '',
        zero: '',
        calibration: '',
        status: '',
        reset: ''
      },
      autoSettings: {
        autoConnect: true,
        autoTare: true,
        autoZero: false,
        pollingInterval: 1000,
        timeout: 3000,
        retryAttempts: 3,
        autoReconnect: true,
        connectionDelay: 1000
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateCommands = (key: keyof NonNullable<typeof formData.commands>, value: string) => {
    setFormData(prev => ({
      ...prev,
      commands: {
        ...prev.commands!,
        [key]: value
      }
    }));
  };

  const updateAutoSettings = (key: keyof NonNullable<typeof formData.autoSettings>, value: any) => {
    setFormData(prev => ({
      ...prev,
      autoSettings: {
        ...prev.autoSettings!,
        [key]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Название модели
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Производитель
          </label>
          <input
            type="text"
            value={formData.manufacturer || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-mono-700 mb-1">
          Модель
        </label>
        <input
          type="text"
          value={formData.model || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
          className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
          required
        />
      </div>

      {/* Настройки подключения */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-mono-900 mb-4">Настройки подключения</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Скорость передачи (bps)
            </label>
            <select
              value={formData.baudRate || 9600}
              onChange={(e) => setFormData(prev => ({ ...prev, baudRate: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            >
              <option value={2400}>2400</option>
              <option value={4800}>4800</option>
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={57600}>57600</option>
              <option value={115200}>115200</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Биты данных
            </label>
            <select
              value={formData.dataBits || 8}
              onChange={(e) => setFormData(prev => ({ ...prev, dataBits: parseInt(e.target.value) as 7 | 8 }))}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            >
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Стоп-биты
            </label>
            <select
              value={formData.stopBits || 1}
              onChange={(e) => setFormData(prev => ({ ...prev, stopBits: parseInt(e.target.value) as 1 | 2 }))}
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-mono-700 mb-1">
            Четность
          </label>
          <select
            value={formData.parity || 'none'}
            onChange={(e) => setFormData(prev => ({ ...prev, parity: e.target.value as 'none' | 'odd' | 'even' }))}
            className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
          >
            <option value="none">Нет</option>
            <option value="odd">Нечетная</option>
            <option value="even">Четная</option>
          </select>
        </div>
      </div>

      {/* Команды */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-mono-900 mb-4">Команды</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Получить вес
            </label>
            <input
              type="text"
              value={formData.commands?.getWeight || ''}
              onChange={(e) => updateCommands('getWeight', e.target.value)}
              placeholder="Например: W\r\n"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Тарирование
            </label>
            <input
              type="text"
              value={formData.commands?.tare || ''}
              onChange={(e) => updateCommands('tare', e.target.value)}
              placeholder="Например: T\r\n"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Обнуление
            </label>
            <input
              type="text"
              value={formData.commands?.zero || ''}
              onChange={(e) => updateCommands('zero', e.target.value)}
              placeholder="Например: Z\r\n"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Калибровка
            </label>
            <input
              type="text"
              value={formData.commands?.calibration || ''}
              onChange={(e) => updateCommands('calibration', e.target.value)}
              placeholder="Например: CAL\r\n"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Статус
            </label>
            <input
              type="text"
              value={formData.commands?.status || ''}
              onChange={(e) => updateCommands('status', e.target.value)}
              placeholder="Например: S\r\n"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-1">
              Сброс
            </label>
            <input
              type="text"
              value={formData.commands?.reset || ''}
              onChange={(e) => updateCommands('reset', e.target.value)}
              placeholder="Например: R\r\n"
              className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Автонастройки */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-mono-900 mb-4">Автонастройки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoSettings?.autoConnect || false}
                onChange={(e) => updateAutoSettings('autoConnect', e.target.checked)}
                className="rounded border-mono-300 text-black focus:ring-mono-500"
              />
              <span className="ml-2 text-sm font-medium text-mono-700">Автоподключение</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoSettings?.autoTare || false}
                onChange={(e) => updateAutoSettings('autoTare', e.target.checked)}
                className="rounded border-mono-300 text-black focus:ring-mono-500"
              />
              <span className="ml-2 text-sm font-medium text-mono-700">Автотарирование</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoSettings?.autoZero || false}
                onChange={(e) => updateAutoSettings('autoZero', e.target.checked)}
                className="rounded border-mono-300 text-black focus:ring-mono-500"
              />
              <span className="ml-2 text-sm font-medium text-mono-700">Автообнуление</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoSettings?.autoReconnect || false}
                onChange={(e) => updateAutoSettings('autoReconnect', e.target.checked)}
                className="rounded border-mono-300 text-black focus:ring-mono-500"
              />
              <span className="ml-2 text-sm font-medium text-mono-700">Автопереподключение</span>
            </label>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Интервал опроса (мс)
              </label>
              <input
                type="number"
                value={formData.autoSettings?.pollingInterval || 1000}
                onChange={(e) => updateAutoSettings('pollingInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Таймаут (мс)
              </label>
              <input
                type="number"
                value={formData.autoSettings?.timeout || 3000}
                onChange={(e) => updateAutoSettings('timeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Попытки
              </label>
              <input
                type="number"
                value={formData.autoSettings?.retryAttempts || 3}
                onChange={(e) => updateAutoSettings('retryAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Задержка подключения (мс)
              </label>
              <input
                type="number"
                value={formData.autoSettings?.connectionDelay || 1000}
                onChange={(e) => updateAutoSettings('connectionDelay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-mono-700 bg-mono-100 rounded-lg hover:bg-mono-200 transition-colors duration-200"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
        >
          {model ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
};

export default ScalesModelsPage;
