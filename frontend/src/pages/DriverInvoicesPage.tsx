import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotifications } from '../hooks/useNotifications';
import { ExpenseInvoice } from '../types/invoice';
import { Driver } from '../types/directories';
import { ConcreteOrder } from '../types/orders';
import PageLayout from '../components/PageLayout';
import ViewToggle from '../components/ViewToggle';
import ExpenseInvoicePrint from '../components/invoice/ExpenseInvoicePrint';
import DriverActionsModal from '../components/invoice/DriverActionsModal';
import { 
  Eye, 
  Printer, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Truck,
  User,
  MapPin,
  FileText,
  Clock,
  ArrowLeft,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const DriverInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useLocalStorage<ExpenseInvoice[]>('expenseInvoices', []);
  const [orders, setOrders] = useLocalStorage<ConcreteOrder[]>('orders', []);
  const [drivers] = useLocalStorage<Driver[]>('drivers', []);
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<ExpenseInvoice | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Получаем текущего водителя (в реальном приложении из auth)
  const currentDriver = drivers[0]; // Заглушка - в реальности из auth store
  
  // Фильтруем накладные только для текущего водителя
  const driverInvoices = useMemo(() => {
    if (!currentDriver) return [];
    
    return invoices.filter(invoice => 
      invoice.delivery.driverId === currentDriver.id
    );
  }, [invoices, currentDriver]);

  // Фильтрация и поиск
  const filteredInvoices = useMemo(() => {
    let filtered = driverInvoices;

    // Поиск по номеру накладной, объекту доставки, клиенту
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.delivery.deliveryObject.toLowerCase().includes(term) ||
        invoice.customerName.toLowerCase().includes(term)
      );
    }

    // Фильтр по дате
    if (dateFrom) {
      filtered = filtered.filter(invoice => 
        new Date(invoice.invoiceDate) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(invoice => 
        new Date(invoice.invoiceDate) <= new Date(dateTo)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
    );
  }, [driverInvoices, searchTerm, dateFrom, dateTo]);

  const handleView = (invoice: ExpenseInvoice) => {
    setSelectedInvoice(invoice);
    setShowPrint(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // В реальном приложении здесь будет экспорт в PDF
    alert('Экспорт в PDF будет реализован');
  };

  const handleActions = (invoice: ExpenseInvoice) => {
    setSelectedInvoice(invoice);
    setShowActions(true);
  };

  const handleSaveActions = (actions: any) => {
    if (selectedInvoice) {
      // Обновляем накладную с действиями водителя
      const updatedInvoice = {
        ...selectedInvoice,
        driverActions: actions,
        updatedAt: new Date().toISOString()
      };
      
      // Обновляем накладную в localStorage
      setInvoices(prev => prev.map(inv => 
        inv.id === selectedInvoice.id ? updatedInvoice : inv
      ));
      
      // Обновляем связанный заказ
      updateRelatedOrder(selectedInvoice, actions);
      
      console.log('Действия водителя сохранены:', updatedInvoice);
      
      // Показываем уведомление об обновлении статуса заказа
      const orderUpdated = selectedInvoice.orderId ? ' Статус заказа обновлен!' : '';
      alert(`Действия водителя сохранены!${orderUpdated}`);
    }
  };

  const updateRelatedOrder = (invoice: ExpenseInvoice, actions: any) => {
    if (!invoice.orderId) return;

    const relatedOrder = orders.find(order => order.id === invoice.orderId);
    if (!relatedOrder) return;

    let newOrderStatus = relatedOrder.status;
    let completionInfo = { ...relatedOrder };

    // Определяем новый статус заказа на основе действий водителя
    if (actions.invoiceStatus === 'delivered') {
      // Накладная подписана - заказ выполнен
      newOrderStatus = 'completed';
      completionInfo = {
        ...relatedOrder,
        status: 'completed',
        completionTime: new Date().toISOString(),
        assignedDriverId: invoice.delivery.driverId,
        assignedDriverName: invoice.delivery.driverName,
        assignedVehicleId: invoice.delivery.vehicleId,
        assignedVehicleNumber: invoice.delivery.vehicleNumber,
        departureTime: actions.departureFromPlantDriver || invoice.timing.departureFromPlant,
        arrivalTime: actions.arrivalAtObject,
        expenseInvoiceId: invoice.id
      };
    } else if (actions.invoiceStatus === 'rejected') {
      // Накладная не подписана - заказ отклонен
      newOrderStatus = 'cancelled';
      completionInfo = {
        ...relatedOrder,
        status: 'cancelled',
        completionTime: new Date().toISOString(),
        assignedDriverId: invoice.delivery.driverId,
        assignedDriverName: invoice.delivery.driverName,
        assignedVehicleId: invoice.delivery.vehicleId,
        assignedVehicleNumber: invoice.delivery.vehicleNumber,
        departureTime: actions.departureFromPlantDriver || invoice.timing.departureFromPlant,
        arrivalTime: actions.arrivalAtObject,
        expenseInvoiceId: invoice.id
      };
    } else if (actions.arrivalConfirmed) {
      // Водитель прибыл на объект - заказ в процессе выполнения
      newOrderStatus = 'in_production';
      completionInfo = {
        ...relatedOrder,
        status: 'in_production',
        assignedDriverId: invoice.delivery.driverId,
        assignedDriverName: invoice.delivery.driverName,
        assignedVehicleId: invoice.delivery.vehicleId,
        assignedVehicleNumber: invoice.delivery.vehicleNumber,
        departureTime: actions.departureFromPlantDriver || invoice.timing.departureFromPlant,
        arrivalTime: actions.arrivalAtObject,
        expenseInvoiceId: invoice.id
      };
    } else if (actions.departureConfirmed) {
      // Водитель выехал с завода - заказ готов к доставке
      newOrderStatus = 'ready';
      completionInfo = {
        ...relatedOrder,
        status: 'ready',
        assignedDriverId: invoice.delivery.driverId,
        assignedDriverName: invoice.delivery.driverName,
        assignedVehicleId: invoice.delivery.vehicleId,
        assignedVehicleNumber: invoice.delivery.vehicleNumber,
        departureTime: actions.departureFromPlantDriver || invoice.timing.departureFromPlant,
        expenseInvoiceId: invoice.id
      };
    }

    // Обновляем заказ в localStorage
    setOrders(prev => prev.map(order => 
      order.id === invoice.orderId ? completionInfo : order
    ));

    console.log(`Заказ ${relatedOrder.id} обновлен:`, {
      oldStatus: relatedOrder.status,
      newStatus: newOrderStatus,
      driverActions: actions
    });

    // Отправляем уведомления всем ролям
    sendOrderNotifications(relatedOrder, completionInfo, invoice, actions);
  };

  const sendOrderNotifications = (oldOrder: ConcreteOrder, newOrder: ConcreteOrder, invoice: ExpenseInvoice, actions: any) => {
    const driverName = invoice.delivery.driverName || 'Водитель';
    const vehicleNumber = invoice.delivery.vehicleNumber || '';

    // Уведомление об изменении статуса заказа
    addNotification({
      title: 'Статус заказа изменен',
      message: `Заказ #${newOrder.id} изменен с "${getOrderStatusText(oldOrder.status)}" на "${getOrderStatusText(newOrder.status)}" водителем ${driverName}`,
      type: 'info',
      userId: '', // для всех ролей
      role: 'dispatcher', // диспетчер
      relatedOrderId: newOrder.id,
      relatedInvoiceId: invoice.id,
      priority: 'medium'
    });

    addNotification({
      title: 'Статус заказа изменен',
      message: `Заказ #${newOrder.id} изменен с "${getOrderStatusText(oldOrder.status)}" на "${getOrderStatusText(newOrder.status)}" водителем ${driverName}`,
      type: 'info',
      userId: '',
      role: 'accountant', // бухгалтер
      relatedOrderId: newOrder.id,
      relatedInvoiceId: invoice.id,
      priority: 'medium'
    });

    addNotification({
      title: 'Статус заказа изменен',
      message: `Заказ #${newOrder.id} изменен с "${getOrderStatusText(oldOrder.status)}" на "${getOrderStatusText(newOrder.status)}" водителем ${driverName}`,
      type: 'info',
      userId: '',
      role: 'director', // директор
      relatedOrderId: newOrder.id,
      relatedInvoiceId: invoice.id,
      priority: 'medium'
    });

    // Специальные уведомления для конкретных статусов
    if (newOrder.status === 'completed') {
      addNotification({
        title: 'Заказ выполнен',
        message: `Заказ #${newOrder.id} успешно выполнен водителем ${driverName} для ${newOrder.customerName}`,
        type: 'success',
        userId: '',
        role: 'dispatcher',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'high'
      });

      addNotification({
        title: 'Заказ выполнен',
        message: `Заказ #${newOrder.id} успешно выполнен водителем ${driverName} для ${newOrder.customerName}`,
        type: 'success',
        userId: '',
        role: 'accountant',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'high'
      });

      addNotification({
        title: 'Заказ выполнен',
        message: `Заказ #${newOrder.id} успешно выполнен водителем ${driverName} для ${newOrder.customerName}`,
        type: 'success',
        userId: '',
        role: 'director',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'high'
      });
    }

    if (newOrder.status === 'cancelled') {
      const reason = actions.rejectionReason || 'Не указана';
      addNotification({
        title: 'Заказ отменен',
        message: `Заказ #${newOrder.id} отменен водителем ${driverName}. Причина: ${reason}`,
        type: 'warning',
        userId: '',
        role: 'dispatcher',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'high'
      });

      addNotification({
        title: 'Заказ отменен',
        message: `Заказ #${newOrder.id} отменен водителем ${driverName}. Причина: ${reason}`,
        type: 'warning',
        userId: '',
        role: 'accountant',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'high'
      });

      addNotification({
        title: 'Заказ отменен',
        message: `Заказ #${newOrder.id} отменен водителем ${driverName}. Причина: ${reason}`,
        type: 'warning',
        userId: '',
        role: 'director',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'high'
      });
    }

    // Уведомления о движении водителя
    if (actions.departureConfirmed) {
      addNotification({
        title: 'Водитель выехал',
        message: `Водитель ${driverName} (${vehicleNumber}) выехал с заказа #${newOrder.id}`,
        type: 'info',
        userId: '',
        role: 'dispatcher',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'medium'
      });

      addNotification({
        title: 'Водитель выехал',
        message: `Водитель ${driverName} (${vehicleNumber}) выехал с заказа #${newOrder.id}`,
        type: 'info',
        userId: '',
        role: 'director',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'medium'
      });
    }

    if (actions.arrivalConfirmed) {
      addNotification({
        title: 'Водитель прибыл',
        message: `Водитель ${driverName} прибыл к заказчику ${newOrder.customerName} (заказ #${newOrder.id})`,
        type: 'info',
        userId: '',
        role: 'dispatcher',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'medium'
      });

      addNotification({
        title: 'Водитель прибыл',
        message: `Водитель ${driverName} прибыл к заказчику ${newOrder.customerName} (заказ #${newOrder.id})`,
        type: 'info',
        userId: '',
        role: 'director',
        relatedOrderId: newOrder.id,
        relatedInvoiceId: invoice.id,
        priority: 'medium'
      });
    }
  };


  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  const getStatusIcon = (invoice: ExpenseInvoice) => {
    if (!invoice.driverActions) {
      return <Clock className="w-4 h-4 text-mono-400" />;
    }

    switch (invoice.driverActions.invoiceStatus) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-mono-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-mono-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-black" />;
      default:
        return <Clock className="w-4 h-4 text-mono-500" />;
    }
  };

  const getInvoiceStatusText = (invoice: ExpenseInvoice) => {
    if (!invoice.driverActions) {
      return 'В ожидании';
    }

    switch (invoice.driverActions.invoiceStatus) {
      case 'delivered':
        return 'Подписали';
      case 'rejected':
        return 'Не подписали';
      case 'completed':
        return 'Завершено';
      default:
        return 'В процессе';
    }
  };

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Ожидает',
      'confirmed': 'Подтвержден',
      'ready': 'Готов к доставке',
      'in_production': 'В производстве',
      'completed': 'Выполнен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  if (showPrint && selectedInvoice) {
    return (
      <div className="p-6">
        <div className="mb-6 p-4 bg-mono-50 border-t border-mono-200 text-center">
          <button
            onClick={() => setShowPrint(false)}
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </button>
        </div>
        <ExpenseInvoicePrint invoice={selectedInvoice} />
      </div>
    );
  }

  return (
    <PageLayout title="Мои накладные">
      <div className="space-y-6">
        {/* Заголовок с информацией о водителе */}
        <div className="bg-mono-50 border border-mono-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-black" />
            <div>
              <h3 className="text-lg font-semibold text-black">
                {currentDriver?.fullName || 'Водитель'}
              </h3>
              <p className="text-black">
                Накладные для доставки
              </p>
            </div>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mono-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск по номеру накладной, объекту или клиенту..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Кнопка фильтров */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </button>

            {/* Переключатель вида */}
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>

          {/* Расширенные фильтры */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-mono-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Дата с
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Дата по
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-mono-600 hover:text-mono-800"
                >
                  Очистить фильтры
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-black" />
              <div className="ml-3">
                <p className="text-sm font-medium text-mono-500">Всего накладных</p>
                <p className="text-2xl font-bold text-mono-900">{driverInvoices.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-mono-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-mono-500">На сегодня</p>
                <p className="text-2xl font-bold text-mono-900">
                  {driverInvoices.filter(inv => {
                    const today = new Date().toDateString();
                    return new Date(inv.invoiceDate).toDateString() === today;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-mono-500">Отфильтровано</p>
                <p className="text-2xl font-bold text-mono-900">{filteredInvoices.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Список накладных */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-mono-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-900 mb-2">
              Накладных не найдено
            </h3>
            <p className="text-mono-500">
              {searchTerm || dateFrom || dateTo 
                ? 'Попробуйте изменить фильтры поиска'
                : 'Для вас пока не созданы накладные'
              }
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              /* Табличный вид */
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-mono-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                          Номер накладной
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                          Дата
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                          Клиент
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                          Объект доставки
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                          Транспорт
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                          Адрес
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-mono-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-mono-900">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                            {new Date(invoice.invoiceDate).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                            {invoice.customerName}
                          </td>
                          <td className="px-6 py-4 text-sm text-mono-500">
                            <div className="max-w-xs truncate">
                              {invoice.delivery.deliveryObject}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                            <div className="flex items-center">
                              <Truck className="w-4 h-4 mr-1" />
                              {invoice.delivery.vehicleNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-mono-500">
                            <div className="max-w-xs truncate">
                              {invoice.delivery.deliveryAddress || 'Не указан'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(invoice)}
                              <span className={invoice.driverActions?.invoiceStatus === 'delivered' ? 'text-mono-600' : 
                                              invoice.driverActions?.invoiceStatus === 'rejected' ? 'text-mono-600' : 
                                              'text-mono-600'}>
                                {getInvoiceStatusText(invoice)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleActions(invoice)}
                                className="text-black hover:text-black"
                                title="Действия водителя"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleView(invoice)}
                                className="text-mono-600 hover:text-mono-900"
                                title="Просмотреть"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowPrint(true);
                                }}
                                className="text-mono-600 hover:text-mono-900"
                                title="Печать"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Карточный вид */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-mono-900">
                          {invoice.invoiceNumber}
                        </h3>
                        <p className="text-sm text-mono-500">
                          {new Date(invoice.invoiceDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleActions(invoice)}
                          className="p-2 text-black hover:bg-mono-50 rounded-lg"
                          title="Действия водителя"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleView(invoice)}
                          className="p-2 text-mono-600 hover:bg-mono-50 rounded-lg"
                          title="Просмотреть"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowPrint(true);
                          }}
                          className="p-2 text-mono-600 hover:bg-mono-50 rounded-lg"
                          title="Печать"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="w-4 h-4 text-mono-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-mono-900">Клиент</p>
                          <p className="text-sm text-mono-500">{invoice.customerName}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-mono-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-mono-900">Объект</p>
                          <p className="text-sm text-mono-500">{invoice.delivery.deliveryObject}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Truck className="w-4 h-4 text-mono-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-mono-900">Транспорт</p>
                          <p className="text-sm text-mono-500">{invoice.delivery.vehicleNumber}</p>
                        </div>
                      </div>

                      {invoice.delivery.deliveryAddress && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-mono-400 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-mono-900">Адрес</p>
                            <p className="text-sm text-mono-500">{invoice.delivery.deliveryAddress}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start">
                        <div className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0">
                          {getStatusIcon(invoice)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-mono-900">Статус</p>
                          <p className={`text-sm ${invoice.driverActions?.invoiceStatus === 'delivered' ? 'text-mono-600' : 
                                              invoice.driverActions?.invoiceStatus === 'rejected' ? 'text-mono-600' : 
                                              'text-mono-600'}`}>
                            {getInvoiceStatusText(invoice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальное окно действий водителя */}
      {selectedInvoice && (
        <DriverActionsModal
          invoice={selectedInvoice}
          isOpen={showActions}
          onClose={() => setShowActions(false)}
          onSave={handleSaveActions}
        />
      )}
    </PageLayout>
  );
};

export default DriverInvoicesPage;
