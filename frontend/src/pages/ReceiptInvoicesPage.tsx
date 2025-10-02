import React, { useState, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ReceiptInvoice, CreateReceiptInvoiceRequest, emptyReceiptInvoices } from '../types/receiptInvoice'
import PageLayout from '../components/PageLayout'
import ViewToggle from '../components/ViewToggle'
import ReceiptInvoiceModal from '../components/invoice/ReceiptInvoiceModal'
import ReceiptInvoicePrint from '../components/invoice/ReceiptInvoicePrint'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Printer, 
  Download,
  FileText,
  Calendar,
  Building2,
  Package
} from 'lucide-react'

export default function ReceiptInvoicesPage() {
  const [invoices, setInvoices] = useLocalStorage<ReceiptInvoice[]>('receiptInvoices', emptyReceiptInvoices)
  const [counterparties] = useLocalStorage<any[]>('counterparties', [])
  const [viewMode, setViewMode] = useLocalStorage<'cards' | 'list'>('receiptInvoicesViewMode', 'list')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<ReceiptInvoice | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<ReceiptInvoice | null>(null)
  const [showPrint, setShowPrint] = useState(false)

  // Фильтрация и поиск
  const filteredInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => invoice.isActive)

    // Поиск по номеру, поставщику, складу
    if (searchTerm) {
      filtered = filtered.filter(invoice => {
        const supplierName = invoice.items.length > 0 ? 
          counterparties.find(cp => cp.id === invoice.items[0].supplier)?.name || '' : ''
        return invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
               supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               invoice.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Фильтр по дате
    if (dateFrom) {
      filtered = filtered.filter(invoice =>
        new Date(invoice.invoiceDate) >= new Date(dateFrom)
      )
    }

    if (dateTo) {
      filtered = filtered.filter(invoice =>
        new Date(invoice.invoiceDate) <= new Date(dateTo)
      )
    }

    return filtered.sort((a, b) => 
      new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
    )
  }, [invoices, searchTerm, dateFrom, dateTo])

  const handleAdd = () => {
    setEditingInvoice(null)
    setIsModalOpen(true)
  }

  const handleEdit = (invoice: ReceiptInvoice) => {
    setEditingInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleView = (invoice: ReceiptInvoice) => {
    setSelectedInvoice(invoice)
    setShowPrint(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту приходную накладную?')) {
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, isActive: false } : invoice
      ))
    }
  }

  const handleSave = (data: CreateReceiptInvoiceRequest) => {
    if (editingInvoice) {
      // Редактирование существующей накладной
      setInvoices(prev => prev.map(invoice => 
        invoice.id === editingInvoice.id 
          ? { 
              ...invoice, 
              ...data,
              items: data.items.map(item => ({
                ...item,
                id: (item as any).id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
              })),
              updatedAt: new Date().toISOString() 
            }
          : invoice
      ))
    } else {
      // Добавление новой накладной
      const newInvoice: ReceiptInvoice = {
        id: Date.now().toString(),
        ...data,
        items: data.items.map(item => ({
          ...item,
          id: (item as any).id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
        })),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user', // В реальном приложении из auth store
        isActive: true
      }
      setInvoices(prev => [...prev, newInvoice])
    }
    setIsModalOpen(false)
    setEditingInvoice(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingInvoice(null)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // В реальном приложении здесь будет экспорт в PDF
    alert('Экспорт в PDF будет реализован')
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'received': return 'Принята'
      case 'completed': return 'Завершена'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'received': return 'bg-mono-100 text-black'
      case 'completed': return 'bg-mono-100 text-green-800'
      default: return 'bg-mono-100 text-mono-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('kk-KZ')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <PageLayout
      title="Приходные накладные"
      subtitle="Управление поступлением товаров и материалов"
    >
      <div className="space-y-6">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-mono-900">Приходные накладные</h2>
              <p className="text-mono-600">Всего: {filteredInvoices.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <button 
              onClick={handleAdd}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Создать накладную</span>
            </button>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg border border-mono-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  placeholder="Поиск по номеру, поставщику, складу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Кнопка фильтров */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors duration-200"
            >
              <Filter className="h-4 w-4" />
              <span>Фильтры</span>
            </button>
          </div>

          {/* Дополнительные фильтры */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-mono-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Дата с
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    Дата по
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Отображение накладных */}
        {viewMode === 'list' ? (
          /* Табличный вид */
          <div className="bg-white rounded-lg border border-mono-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-mono-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Номер
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Поставщик
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Склад
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
                        <div className="text-sm font-medium text-mono-900">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                        {invoice.items.length > 0 ? 
                          counterparties.find(cp => cp.id === invoice.items[0].supplier)?.name || 'Неизвестный поставщик' : 
                          'Нет поставщика'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mono-900">
                        {invoice.warehouse}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleView(invoice)}
                            className="text-black hover:text-black"
                            title="Просмотр"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(invoice)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(invoice.id)}
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
          </div>
        ) : (
          /* Карточный вид */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-lg border border-mono-200 p-6 hover:shadow-lg transition-shadow duration-200 relative">
                {/* Кнопки действий в правом верхнем углу */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button 
                    onClick={() => handleView(invoice)}
                    className="p-1 text-black hover:text-black rounded hover:bg-mono-50 transition-colors duration-200"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(invoice)}
                    className="p-1 text-indigo-600 hover:text-indigo-900 rounded hover:bg-indigo-50 transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(invoice.id)}
                    className="p-1 text-mono-600 hover:text-red-900 rounded hover:bg-red-50 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Основная информация */}
                <div className="mb-4 pr-20">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-mono-900 truncate">
                      {invoice.invoiceNumber}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                  <p className="text-sm text-mono-600">{formatDate(invoice.invoiceDate)}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-mono-600">
                    <Building2 className="h-4 w-4 text-mono-400 mr-2" />
                    <span className="truncate">
                      {invoice.items.length > 0 ? 
                        counterparties.find(cp => cp.id === invoice.items[0].supplier)?.name || 'Неизвестный поставщик' : 
                        'Нет поставщика'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-mono-600">
                    <Package className="h-4 w-4 text-mono-400 mr-2" />
                    <span className="truncate">{invoice.warehouse}</span>
                  </div>

                  <div className="flex items-center text-sm text-mono-600">
                    <FileText className="h-4 w-4 text-mono-400 mr-2" />
                    <span>{invoice.items.length} товар(ов)</span>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="mt-4 pt-4 border-t border-mono-200 flex justify-between">
                  <button
                    onClick={() => handleView(invoice)}
                    className="flex items-center space-x-1 px-3 py-1 text-black hover:text-black transition-colors duration-200"
                  >
                    <Printer className="h-4 w-4" />
                    <span className="text-sm">Печать</span>
                  </button>
                  <button
                    onClick={() => handleExportPDF()}
                    className="flex items-center space-x-1 px-3 py-1 text-mono-600 hover:text-green-800 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Пустое состояние */}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-mono-400" />
            <h3 className="mt-4 text-lg font-medium text-mono-900">
              {searchTerm || dateFrom || dateTo ? 'Накладные не найдены' : 'Нет приходных накладных'}
            </h3>
            <p className="mt-2 text-mono-600">
              {searchTerm || dateFrom || dateTo 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Создайте первую приходную накладную для начала работы'
              }
            </p>
          </div>
        )}

        {/* Модальное окно для создания/редактирования */}
        <ReceiptInvoiceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingInvoice ? 'Редактировать приходную накладную' : 'Создать приходную накладную'}
          invoice={editingInvoice}
          onSave={handleSave}
        />

        {/* Модальное окно для печати */}
        {showPrint && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-mono-900">
                    Приходная накладная {selectedInvoice.invoiceNumber}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
                    >
                      <Printer className="h-4 w-4" />
                      <span>В печать</span>
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => setShowPrint(false)}
                      className="text-mono-400 hover:text-mono-600"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <ReceiptInvoicePrint invoice={selectedInvoice} />
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
