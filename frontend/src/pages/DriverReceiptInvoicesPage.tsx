import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import Modal from '../components/Modal'
import ReceiptInvoiceModal from '../components/invoice/ReceiptInvoiceModal'
import ReceiptInvoicePrint from '../components/invoice/ReceiptInvoicePrint'
import { ReceiptInvoice, CreateReceiptInvoiceRequest } from '../types/receiptInvoice'
import { Plus, Search, Eye, Edit, Trash2, FileText, Download, Calendar, Truck, Scale } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types/auth'

export default function DriverReceiptInvoicesPage() {
  const { user } = useAuthStore()
  const [receiptInvoices, setReceiptInvoices] = useLocalStorage<ReceiptInvoice[]>('receiptInvoices', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'completed'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<ReceiptInvoice | null>(null)
  const [viewingInvoice, setViewingInvoice] = useState<ReceiptInvoice | null>(null)
  const [printingInvoice, setPrintingInvoice] = useState<ReceiptInvoice | null>(null)

  // Фильтрация накладных - водитель видит только свои накладные
  const filteredInvoices = receiptInvoices.filter(invoice => {
    const matchesUser = invoice.createdBy === user?.id // Только накладные текущего водителя
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesUser && matchesSearch && matchesStatus
  })

  // Статистика для водителя - только его накладные
  const driverInvoices = receiptInvoices.filter(inv => inv.createdBy === user?.id)
  const stats = {
    total: driverInvoices.length,
    drafts: driverInvoices.filter(inv => inv.status === 'draft').length,
    completed: driverInvoices.filter(inv => inv.status === 'completed').length,
    today: driverInvoices.filter(inv => {
      const today = new Date().toDateString()
      const invoiceDate = new Date(inv.invoiceDate).toDateString()
      return today === invoiceDate
    }).length
  }

  const handleAdd = () => {
    setEditingInvoice(null)
    setIsModalOpen(true)
  }

  const handleEdit = (invoice: ReceiptInvoice) => {
    setEditingInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleView = (invoice: ReceiptInvoice) => {
    setViewingInvoice(invoice)
  }

  const handlePrint = (invoice: ReceiptInvoice) => {
    setPrintingInvoice(invoice)
  }

  const handleSave = (data: CreateReceiptInvoiceRequest) => {
    if (editingInvoice) {
      // Редактирование существующей накладной
      setReceiptInvoices(prev => prev.map(inv => 
        inv.id === editingInvoice.id 
          ? { 
              ...inv, 
              invoiceNumber: data.invoiceNumber,
              invoiceDate: data.invoiceDate,
              warehouse: data.warehouse,
              seal: data.seal,
              receivedBy: data.receivedBy,
              issuedBy: data.issuedBy,
              items: data.items.map((item, index) => ({
                ...item,
                id: editingInvoice.items[index]?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
              })),
              updatedAt: new Date().toISOString() 
            }
          : inv
      ))
    } else {
      // Создание новой накладной
      const newInvoice: ReceiptInvoice = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        warehouse: data.warehouse,
        seal: data.seal,
        receivedBy: data.receivedBy,
        issuedBy: data.issuedBy,
        items: data.items.map(item => ({
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        })),
        status: 'draft',
        createdBy: user?.id || 'unknown',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setReceiptInvoices(prev => [newInvoice, ...prev])
    }
    setIsModalOpen(false)
    setEditingInvoice(null)
  }

  const handleDelete = (invoice: ReceiptInvoice) => {
    if (confirm(`Удалить накладную ${invoice.invoiceNumber}?`)) {
      setReceiptInvoices(prev => prev.filter(inv => inv.id !== invoice.id))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-mono-100 text-green-800'
      default: return 'bg-mono-100 text-mono-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик'
      case 'completed': return 'Завершена'
      default: return 'Неизвестно'
    }
  }

  // Проверяем права доступа - для водителей и разработчиков
  if (user?.role !== UserRole.DRIVER && user?.role !== UserRole.DEVELOPER) {
    return (
      <PageLayout title="Доступ ограничен">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Truck className="h-12 w-12 text-mono-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-900 mb-2">Доступ ограничен</h3>
            <p className="text-mono-500">Эта страница доступна только водителям</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Приходные накладные">
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-mono-900 flex items-center">
              <Truck className="h-8 w-8 text-black mr-3" />
              Мои приходные накладные
            </h1>
            <p className="text-mono-600 mt-1">Управление вашими приходными накладными</p>
          </div>
          <button
            onClick={handleAdd}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Создать накладную
          </button>
        </div>

        {/* Статистика для водителя */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-mono-200">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-black" />
              <div className="ml-3">
                <p className="text-sm font-medium text-mono-500">Мои накладные</p>
                <p className="text-2xl font-bold text-mono-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-mono-200">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-mono-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-mono-500">Мои черновики</p>
                <p className="text-2xl font-bold text-mono-900">{stats.drafts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-mono-200">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-mono-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-mono-500">Мои завершенные</p>
                <p className="text-2xl font-bold text-mono-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-mono-200">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-mono-500">Мои сегодня</p>
                <p className="text-2xl font-bold text-mono-900">{stats.today}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white p-4 rounded-lg border border-mono-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-mono-400" />
                <input
                  type="text"
                  placeholder="Поиск по номеру накладной..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'completed')}
                className="px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
              >
                <option value="all">Все статусы</option>
                <option value="draft">Черновики</option>
                <option value="completed">Завершенные</option>
              </select>
            </div>
          </div>
        </div>

        {/* Список накладных */}
        <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-mono-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-mono-900 mb-2">Накладные не найдены</h3>
              <p className="text-mono-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить фильтры поиска'
                  : 'У вас пока нет приходных накладных. Создайте первую!'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Создать накладную
                </button>
              )}
            </div>
          ) : (
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
                      Склад
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Позиций
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-mono-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-mono-900">
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                        {invoice.warehouse}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-500">
                        {invoice.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(invoice)}
                            className="text-black hover:text-black"
                            title="Просмотр"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-mono-600 hover:text-green-900"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(invoice)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Печать"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice)}
                            className="text-mono-600 hover:text-red-900"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания/редактирования */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingInvoice(null)
        }}
        title={editingInvoice ? 'Редактировать накладную' : 'Создать приходную накладную'}
      >
        <ReceiptInvoiceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingInvoice(null)
          }}
          onSave={handleSave}
          invoice={editingInvoice}
          title={editingInvoice ? 'Редактировать накладную' : 'Создать приходную накладную'}
        />
      </Modal>

      {/* Модальное окно просмотра */}
      <Modal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title={`Просмотр накладной ${viewingInvoice?.invoiceNumber}`}
        size="lg"
      >
        {viewingInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-mono-700">Номер накладной:</span>
                <p className="text-mono-900">{viewingInvoice.invoiceNumber}</p>
              </div>
              <div>
                <span className="font-medium text-mono-700">Дата:</span>
                <p className="text-mono-900">{formatDate(viewingInvoice.invoiceDate)}</p>
              </div>
              <div>
                <span className="font-medium text-mono-700">Склад:</span>
                <p className="text-mono-900">{viewingInvoice.warehouse}</p>
              </div>
              <div>
                <span className="font-medium text-mono-700">Статус:</span>
                <p className="text-mono-900">{getStatusText(viewingInvoice.status)}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-mono-700 mb-2">Позиции накладной:</h4>
              <div className="space-y-2">
                {viewingInvoice.items.map((item, index) => (
                  <div key={item.id} className="p-3 bg-mono-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Машина:</span> {item.vehicleNumber}</div>
                      <div><span className="font-medium">Поставщик:</span> {item.supplier}</div>
                      <div><span className="font-medium">Покупатель:</span> {item.buyer}</div>
                      <div><span className="font-medium">Материал:</span> {item.material}</div>
                      <div><span className="font-medium">Брутто:</span> {item.bruttoWeight ? `${item.bruttoWeight} кг` : '—'}</div>
                      <div><span className="font-medium">Тара:</span> {item.taraWeight ? `${item.taraWeight} кг` : '—'}</div>
                      <div><span className="font-medium">Нетто:</span> {item.netWeight ? `${item.netWeight} кг` : '—'}</div>
                      <div><span className="font-medium">Итоговый вес:</span> {item.finalWeight ? `${item.finalWeight} кг` : '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Модальное окно печати */}
      <Modal
        isOpen={!!printingInvoice}
        onClose={() => setPrintingInvoice(null)}
        title={`Печать накладной ${printingInvoice?.invoiceNumber}`}
        size="lg"
      >
        {printingInvoice && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-mono-600">
                Нажмите Ctrl+P для печати или используйте кнопку печати браузера
              </p>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Печать
              </button>
            </div>
            <ReceiptInvoicePrint invoice={printingInvoice} />
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
