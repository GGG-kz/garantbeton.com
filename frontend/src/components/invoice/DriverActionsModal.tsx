import React, { useState } from 'react';
import { ExpenseInvoice, InvoiceDriverActions, InvoiceStatus } from '../../types/invoice';
import { Check, X, Clock, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface DriverActionsModalProps {
  invoice: ExpenseInvoice;
  isOpen: boolean;
  onClose: () => void;
  onSave: (actions: InvoiceDriverActions) => void;
}

const STATUS_OPTIONS = [
  { value: 'delivered' as InvoiceStatus, label: 'Подписали накладную', icon: CheckCircle, color: 'text-mono-600' },
  { value: 'rejected' as InvoiceStatus, label: 'Не подписали накладную', icon: XCircle, color: 'text-mono-600' },
];

const DriverActionsModal: React.FC<DriverActionsModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSave
}) => {
  const [actions, setActions] = useState<InvoiceDriverActions>(
    invoice.driverActions || {
      departureConfirmed: false,
      arrivalConfirmed: false,
      departureFromObjectConfirmed: false,
      arrivalAtPlantConfirmed: false,
      invoiceStatus: 'pending',
    }
  );

  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const handleSave = () => {
    const updatedActions: InvoiceDriverActions = {
      ...actions,
      completedAt: actions.invoiceStatus === 'delivered' || actions.invoiceStatus === 'rejected' 
        ? new Date().toISOString() 
        : undefined,
    };
    
    onSave(updatedActions);
    onClose();
  };

  const handleStatusChange = (status: InvoiceStatus) => {
    setActions(prev => ({
      ...prev,
      invoiceStatus: status
    }));
    
    if (status === 'rejected') {
      setShowRejectionReason(true);
    } else {
      setShowRejectionReason(false);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const handleTimeAction = (action: 'departure' | 'arrival' | 'departureFromObject' | 'arrivalAtPlant') => {
    const currentTime = getCurrentTime();
    
    setActions(prev => ({
      ...prev,
      [action === 'departure' ? 'departureFromPlantDriver' : 
       action === 'arrival' ? 'arrivalAtObject' :
       action === 'departureFromObject' ? 'departureFromObject' :
       'arrivalAtPlant']: currentTime,
      [action === 'departure' ? 'departureConfirmed' :
       action === 'arrival' ? 'arrivalConfirmed' :
       action === 'departureFromObject' ? 'departureFromObjectConfirmed' :
       'arrivalAtPlantConfirmed']: true
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-mono-900">
              Действия водителя
            </h2>
            <button
              onClick={onClose}
              className="text-mono-400 hover:text-mono-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Invoice Info */}
          <div className="bg-mono-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-mono-700">Номер накладной:</span>
                <p className="text-mono-900">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <span className="font-medium text-mono-700">Клиент:</span>
                <p className="text-mono-900">{invoice.customerName}</p>
              </div>
              <div>
                <span className="font-medium text-mono-700">Объект:</span>
                <p className="text-mono-900">{invoice.delivery.deliveryObject}</p>
              </div>
              <div>
                <span className="font-medium text-mono-700">Адрес:</span>
                <p className="text-mono-900">{invoice.delivery.deliveryAddress || 'Не указан'}</p>
              </div>
            </div>
            {invoice.orderId && (
              <div className="mt-4 p-3 bg-mono-50 border border-mono-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-mono-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-black">
                    Связан с заказом #{invoice.orderId}
                  </span>
                </div>
                <p className="text-xs text-black mt-1">
                  Статус заказа будет автоматически обновлен при сохранении действий
                </p>
              </div>
            )}
          </div>

          {/* Timing Actions */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-mono-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Фиксация времени
            </h3>

            {/* Departure from Plant */}
            <div className="border border-mono-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-mono-900">Убытие с завода</h4>
                  <p className="text-sm text-mono-500">
                    Диспетчер: {invoice.timing.departureFromPlant}
                    {actions.departureFromPlantDriver && (
                      <span className="ml-2 text-black">
                        → Водитель: {actions.departureFromPlantDriver}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleTimeAction('departure')}
                  disabled={actions.departureConfirmed}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    actions.departureConfirmed
                      ? 'bg-mono-100 text-mono-800'
                      : 'bg-black text-white hover:bg-black'
                  }`}
                >
                  {actions.departureConfirmed ? 'Подтверждено' : 'Подтвердить'}
                </button>
              </div>
            </div>

            {/* Arrival at Object */}
            <div className="border border-mono-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-mono-900">Прибытие на объект</h4>
                  {actions.arrivalAtObject && (
                    <p className="text-sm text-black">
                      Время: {actions.arrivalAtObject}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleTimeAction('arrival')}
                  disabled={actions.arrivalConfirmed}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    actions.arrivalConfirmed
                      ? 'bg-mono-100 text-mono-800'
                      : 'bg-black text-white hover:bg-black'
                  }`}
                >
                  {actions.arrivalConfirmed ? 'Подтверждено' : 'Отметить прибытие'}
                </button>
              </div>
            </div>

            {/* Departure from Object */}
            <div className="border border-mono-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-mono-900">Убытие с объекта</h4>
                  {actions.departureFromObject && (
                    <p className="text-sm text-black">
                      Время: {actions.departureFromObject}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleTimeAction('departureFromObject')}
                  disabled={actions.departureFromObjectConfirmed}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    actions.departureFromObjectConfirmed
                      ? 'bg-mono-100 text-mono-800'
                      : 'bg-black text-white hover:bg-black'
                  }`}
                >
                  {actions.departureFromObjectConfirmed ? 'Подтверждено' : 'Отметить убытие'}
                </button>
              </div>
            </div>

            {/* Arrival at Plant */}
            <div className="border border-mono-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-mono-900">Прибытие на завод</h4>
                  {actions.arrivalAtPlant && (
                    <p className="text-sm text-black">
                      Время: {actions.arrivalAtPlant}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleTimeAction('arrivalAtPlant')}
                  disabled={actions.arrivalAtPlantConfirmed}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    actions.arrivalAtPlantConfirmed
                      ? 'bg-mono-100 text-mono-800'
                      : 'bg-black text-white hover:bg-black'
                  }`}
                >
                  {actions.arrivalAtPlantConfirmed ? 'Подтверждено' : 'Отметить прибытие'}
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Status */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-mono-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Статус накладной
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {STATUS_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      actions.invoiceStatus === option.value
                        ? 'border-mono-500 bg-mono-50'
                        : 'border-mono-200 hover:border-mono-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="invoiceStatus"
                      value={option.value}
                      checked={actions.invoiceStatus === option.value}
                      onChange={() => handleStatusChange(option.value)}
                      className="sr-only"
                    />
                    <IconComponent className={`w-5 h-5 mr-3 ${option.color}`} />
                    <div className="flex-1">
                      <span className="font-medium text-mono-900">{option.label}</span>
                      {invoice.orderId && (
                        <p className="text-xs text-mono-500 mt-1">
                          {option.value === 'delivered' 
                            ? 'Заказ будет отмечен как "Выполнен"'
                            : option.value === 'rejected'
                            ? 'Заказ будет отмечен как "Отменен"'
                            : ''
                          }
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Rejection Reason */}
            {showRejectionReason && (
              <div className="mt-4 p-4 bg-mono-50 border border-mono-200 rounded-lg">
                <label className="block text-sm font-medium text-mono-800 mb-2">
                  Причина отказа
                </label>
                <textarea
                  value={actions.rejectionReason || ''}
                  onChange={(e) => setActions(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  placeholder="Укажите причину, по которой накладная не была подписана..."
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Driver Notes */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-mono-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Заметки водителя
              </h3>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-black hover:text-black text-sm"
              >
                {showNotes ? 'Скрыть' : 'Добавить'}
              </button>
            </div>

            {showNotes && (
              <textarea
                value={actions.driverNotes || ''}
                onChange={(e) => setActions(prev => ({ ...prev, driverNotes: e.target.value }))}
                placeholder="Дополнительная информация о доставке..."
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                rows={3}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-mono-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-mono-700 border border-mono-300 rounded-lg hover:bg-mono-50"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverActionsModal;
