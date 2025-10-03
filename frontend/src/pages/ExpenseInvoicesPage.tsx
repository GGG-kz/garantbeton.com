import { useState, useMemo } from 'react'
import { ExpenseInvoice, CreateInvoiceRequest } from '../types/invoice'
import { useAuthStore } from '../stores/authStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import ViewToggle from '../components/ViewToggle'
import ExpenseInvoiceForm from '../components/invoice/ExpenseInvoiceForm'
import ExpenseInvoicePrint from '../components/invoice/ExpenseInvoicePrint'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Printer, 
  Download,
  Calendar,
  Building2,
  User,
  Truck,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Archive,
  ArrowLeft
} from 'lucide-react'
import PageLayout from '../components/PageLayout'

const mockInvoices: ExpenseInvoice[] = []

export default function ExpenseInvoicesPage() {
  // Принудительное обновление для применения изменений - версия 4
  console.log('ExpenseInvoicesPage loaded - version 4 - duplicate button in cards')
  const { user } = useAuthStore()
  
  // Функция для генерации следующего номера накладной
  const generateNextInvoiceNumber = () => {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    
    // Находим все накладные за сегодня
    const todayInvoices = invoices.filter(invoice => 
      invoice.invoiceNumber.startsWith(`РН-${dateStr}`)
    )
    
    // Получаем следующий номер
    const nextNumber = todayInvoices.length + 1
    
    return `РН-${dateStr}-${nextNumber.toString().padStart(3, '0')}`
  }
  const [invoices, setInvoices] = useLocalStorage<ExpenseInvoice[]>('expenseInvoices', mockInvoices)
  const [viewMode, setViewMode] = useLocalStorage<'cards' | 'list'>('invoicesViewMode', 'list')
  const [showForm, setShowForm] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<ExpenseInvoice | null>(null)
  const [showPrint, setShowPrint] = useState(false)
  const [printInvoice, setPrintInvoice] = useState<ExpenseInvoice | null>(null)
  
  // Состояние для фильтров и поиска
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Состояние для сортировки
  const [sortField, setSortField] = useState<keyof ExpenseInvoice>('invoiceDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Состояние для выбранных элементов
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  // Получаем уникальные значения для фильтров
  const suppliers = useMemo(() => {
    return Array.from(new Set(invoices.map(invoice => invoice.supplier))).sort()
  }, [invoices])

  const customers = useMemo(() => {
    return Array.from(new Set(invoices.map(invoice => invoice.customerName))).sort()
  }, [invoices])

  // Фильтрация и сортировка данных
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      // Поиск по тексту
      if (searchTerm && !invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !invoice.delivery.deliveryObject.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Фильтр по поставщику
      if (selectedSupplier && invoice.supplier !== selectedSupplier) {
        return false
      }

      // Фильтр по покупателю
      if (selectedCustomer && invoice.customerName !== selectedCustomer) {
        return false
      }

      // Фильтр по дате
      if (dateFrom && invoice.invoiceDate < dateFrom) {
        return false
      }
      if (dateTo && invoice.invoiceDate > dateTo) {
        return false
      }

      return true
    })

    // Сортировка
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Обработка разных типов данных
      if (sortField === 'invoiceDate') {
        aValue = new Date(a.invoiceDate).getTime()
        bValue = new Date(b.invoiceDate).getTime()
      } else if (sortField === 'total') {
        aValue = a.total || 0
        bValue = b.total || 0
      } else {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [invoices, searchTerm, selectedSupplier, selectedCustomer, dateFrom, dateTo, sortField, sortDirection])

  // Пагинация
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedInvoices.slice(startIndex, endIndex)
  }, [filteredAndSortedInvoices, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage)

  // Функции для работы с накладными
  const handleSort = (field: keyof ExpenseInvoice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedInvoices.length === paginatedInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(paginatedInvoices.map(invoice => invoice.id))
    }
  }

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const handleBulkDelete = () => {
    if (selectedInvoices.length === 0) return
    
    if (window.confirm(`Вы уверены, что хотите удалить ${selectedInvoices.length} накладных?`)) {
      setInvoices(prev => prev.filter(invoice => !selectedInvoices.includes(invoice.id)))
      setSelectedInvoices([])
    }
  }

  const handleDuplicate = (invoice: ExpenseInvoice) => {
    const duplicatedInvoice: ExpenseInvoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber: generateNextInvoiceNumber(),
      invoiceDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      receivedBy: ''
    }
    setInvoices(prev => [duplicatedInvoice, ...prev])
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSupplier('')
    setSelectedCustomer('')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const getSortIcon = (field: keyof ExpenseInvoice) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  // Проверяем доступ диспетчера
  if (user?.role !== 'dispatcher') {
    return (
      <PageLayout title="Расходные накладные">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-16 w-16 text-mono-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-900 mb-2">Доступ запрещён</h3>
            <p className="text-mono-500">Эта функция доступна только диспетчерам</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.delivery.deliveryObject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setEditingInvoice(null)
    setShowForm(true)
  }

  const handleEdit = (invoice: ExpenseInvoice) => {
    setEditingInvoice(invoice)
    setShowForm(true)
  }

  const handleDelete = (invoiceId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту накладную?')) {
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId))
    }
  }

  const handleView = (invoice: ExpenseInvoice) => {
    setPrintInvoice(invoice)
    setShowPrint(true)
  }

  const handlePrint = (invoice: ExpenseInvoice) => {
    setPrintInvoice(invoice)
    setShowPrint(true)
    
    // Печать через браузер
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleExportPDF = async (invoice: ExpenseInvoice) => {
    // Здесь будет логика экспорта в PDF
    // Пока что просто показываем сообщение
    alert('Функция экспорта в PDF будет реализована в следующей версии')
  }

  const handleSave = (data: CreateInvoiceRequest) => {
    if (editingInvoice) {
      // Редактирование существующей накладной
      setInvoices(prev => prev.map(invoice => 
        invoice.id === editingInvoice.id 
          ? { ...invoice, ...data, updatedAt: new Date().toISOString() }
          : invoice
      ))
    } else {
      // Создание новой накладной
      const newInvoice: ExpenseInvoice = {
        ...data,
        id: Date.now().toString(),
        invoiceNumber: generateNextInvoiceNumber(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.id || '',
        createdByName: user?.fullName || user?.login || '',
        isActive: true
      }
      setInvoices(prev => [newInvoice, ...prev])
    }
    
    setShowForm(false)
    setEditingInvoice(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('kk-KZ')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (showForm) {
    return (
      <PageLayout title={editingInvoice ? 'Редактировать накладную' : 'Создать накладную'}>
        <ExpenseInvoiceForm
          invoice={editingInvoice}
          onSave={handleSave}
          isEditing={!!editingInvoice}
        />
        <div className="mt-6 p-4 bg-mono-50 border-t border-mono-200 text-center">
          <button
            onClick={() => {
              setShowForm(false)
              setEditingInvoice(null)
            }}
            className="flex items-center mx-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </button>
        </div>
      </PageLayout>
    )
  }

  if (showPrint && printInvoice) {
    return (
      <div className="print-container">
        <ExpenseInvoicePrint invoice={printInvoice} />
        <ExpenseInvoicePrint invoice={printInvoice} isDuplicate={true} />
        <div className="mt-6 p-4 bg-mono-50 border-t border-mono-200 text-center">
          <button
            onClick={() => setShowPrint(false)}
            className="flex items-center mx-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </button>
        </div>
      </div>
    )
  }

  return (
    <PageLayout title="Расходные накладные">
      <div className="space-y-6">
        {/* Заголовок и кнопки */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-mono-900">Расходные накладные</h1>
            <p className="text-mono-600">Создание и управление расходными накладными</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать накладную
          </button>
        </div>

        {/* Поиск, фильтры и переключатель вида */}
        <div className="space-y-4">
          {/* Строка поиска и основных действий */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mono-400" />
                <input
                  type="text"
                  placeholder="Поиск по номеру, покупателю, поставщику или объекту..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Кнопка фильтров */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-black text-white border-blue-600' 
                    : 'bg-white text-mono-700 border-mono-300 hover:bg-mono-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
                {(selectedSupplier || selectedCustomer || dateFrom || dateTo) && (
                  <span className="ml-2 bg-mono-500 text-white text-xs rounded-full px-2 py-1">
                    {[selectedSupplier, selectedCustomer, dateFrom, dateTo].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {/* Массовые действия */}
              {selectedInvoices.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mono-600">
                    Выбрано: {selectedInvoices.length}
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center px-3 py-2 bg-mono-600 text-white rounded-lg hover:bg-mono-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </button>
                </div>
              )}
              
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>

          {/* Расширенные фильтры */}
          {showFilters && (
            <div className="bg-mono-50 p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">Поставщик</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500"
                  >
                    <option value="">Все поставщики</option>
                    {suppliers.map(supplier => (
                      <option key={supplier} value={supplier}>{supplier}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">Покупатель</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500"
                  >
                    <option value="">Все покупатели</option>
                    {customers.map(customer => (
                      <option key={customer} value={customer}>{customer}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">Дата от</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">Дата до</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-mono-300 rounded-md focus:ring-2 focus:ring-mono-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
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
        <div className="bg-mono-50 p-4 rounded-lg border border-mono-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-black">
              Показано: {paginatedInvoices.length} из {filteredAndSortedInvoices.length} накладных
              {filteredAndSortedInvoices.length !== invoices.length && (
                <span className="ml-2 text-black">
                  (отфильтровано из {invoices.length})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-black">
              <span>Элементов на странице:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-blue-300 rounded text-black"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Список накладных */}
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-mono-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-900 mb-2">Накладных не найдено</h3>
            <p className="text-mono-500 mb-4">
              {searchTerm || selectedSupplier || selectedCustomer || dateFrom || dateTo 
                ? 'Попробуйте изменить критерии поиска или фильтры' 
                : 'Создайте первую расходную накладную'
              }
            </p>
            {!searchTerm && !selectedSupplier && !selectedCustomer && !dateFrom && !dateTo && (
              <button
                onClick={handleCreate}
                className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-black mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать накладную
              </button>
            )}
          </div>
         ) : viewMode === 'list' ? (
           <>
             <div className="bg-white rounded-lg shadow overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '900px' }}>
              <thead className="bg-mono-50">
                <tr>
                  <th className="px-1 py-1 text-left text-xs font-medium text-mono-500 uppercase tracking-wider w-8">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-mono-300 text-black focus:ring-mono-500 w-3 h-3"
                    />
                  </th>
                  <th 
                    className="px-1 py-1 text-left text-xs font-medium text-mono-500 uppercase tracking-wider cursor-pointer hover:bg-mono-100 w-28"
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    <div className="flex items-center gap-1">
                      Номер / Дата
                      {getSortIcon('invoiceNumber')}
                    </div>
                  </th>
                  <th 
                    className="px-1 py-1 text-left text-xs font-medium text-mono-500 uppercase tracking-wider cursor-pointer hover:bg-mono-100 w-32"
                    onClick={() => handleSort('supplier')}
                  >
                    <div className="flex items-center gap-1">
                      Поставщик
                      {getSortIcon('supplier')}
                    </div>
                  </th>
                  <th 
                    className="px-1 py-1 text-left text-xs font-medium text-mono-500 uppercase tracking-wider cursor-pointer hover:bg-mono-100 w-32"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center gap-1">
                      Покупатель
                      {getSortIcon('customerName')}
                    </div>
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-medium text-mono-500 uppercase tracking-wider w-36">
                    Объект доставки
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-medium text-mono-500 uppercase tracking-wider w-28">
                    Водитель / Авто
                  </th>
                  <th 
                    className="px-1 py-1 text-left text-xs font-medium text-mono-500 uppercase tracking-wider cursor-pointer hover:bg-mono-100 w-20"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center gap-1">
                      Сумма
                      {getSortIcon('total')}
                    </div>
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-medium text-mono-500 uppercase tracking-wider w-28">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className={`hover:bg-mono-50 ${selectedInvoices.includes(invoice.id) ? 'bg-mono-50' : ''}`}>
                    <td className="px-1 py-1 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => handleSelectInvoice(invoice.id)}
                        className="rounded border-mono-300 text-black focus:ring-mono-500 w-3 h-3"
                      />
                    </td>
                    <td className="px-1 py-1 whitespace-nowrap">
                      <div>
                        <div className="text-xs font-medium text-mono-900 leading-none">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-mono-500 leading-none">{formatDate(invoice.invoiceDate)}</div>
                      </div>
                    </td>
                    <td className="px-1 py-1">
                      <div className="text-xs text-mono-900 leading-none" title={invoice.supplier}>
                        {invoice.supplier}
                      </div>
                    </td>
                    <td className="px-1 py-1">
                      <div className="text-xs text-mono-900 leading-none" title={invoice.customerName}>
                        {invoice.customerName}
                      </div>
                    </td>
                    <td className="px-1 py-1">
                      <div className="text-xs text-mono-900 leading-none" title={invoice.delivery.deliveryObject}>
                        {invoice.delivery.deliveryObject}
                      </div>
                    </td>
                    <td className="px-1 py-1 whitespace-nowrap">
                      <div>
                        <div className="text-xs text-mono-900 leading-none" title={invoice.delivery.driverName}>
                          {invoice.delivery.driverName}
                        </div>
                        <div className="text-xs text-mono-500 leading-none" title={invoice.delivery.vehicleNumber}>
                          {invoice.delivery.vehicleNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-1 py-1 whitespace-nowrap">
                      <div className="text-xs font-medium text-mono-900 leading-none">
                        {invoice.total ? formatCurrency(invoice.total) : '—'}
                      </div>
                    </td>
                    <td className="px-1 py-1 whitespace-nowrap">
                      <div className="flex items-center space-x-0.5">
                        <button
                          onClick={() => handleView(invoice)}
                          className="p-0.5 text-black hover:text-black hover:bg-mono-100 rounded"
                          title="Просмотр"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="p-0.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded"
                          title="Редактировать"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(invoice)}
                          className="p-0.5 text-mono-600 hover:text-mono-900 hover:bg-mono-100 rounded"
                          title="Дублировать"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handlePrint(invoice)}
                          className="p-0.5 text-mono-600 hover:text-mono-900 hover:bg-mono-100 rounded"
                          title="Печать"
                        >
                          <Printer className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleExportPDF(invoice)}
                          className="p-0.5 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded"
                          title="Экспорт PDF"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-0.5 text-mono-600 hover:text-black hover:bg-red-100 rounded"
                          title="Удалить"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
               </tbody>
             </table>
               </div>
             </div>
          
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-mono-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Предыдущая
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следующая
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-mono-700">
                    Показано{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                    {' '}-{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)}
                    </span>
                    {' '}из{' '}
                    <span className="font-medium">{filteredAndSortedInvoices.length}</span>
                    {' '}результатов
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-mono-300 bg-white text-sm font-medium text-mono-500 hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Номера страниц */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-mono-50 border-mono-500 text-black'
                                : 'bg-white border-mono-300 text-mono-500 hover:bg-mono-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="relative inline-flex items-center px-4 py-2 border border-mono-300 bg-white text-sm font-medium text-mono-700">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-mono-300 bg-white text-sm font-medium text-mono-500 hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedInvoices.map((invoice) => (
                <div key={invoice.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-mono-900">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-mono-500">{formatDate(invoice.invoiceDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-mono-900">
                      {invoice.total ? formatCurrency(invoice.total) : '—'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-mono-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{invoice.customerName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-mono-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{invoice.delivery.deliveryObject}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-mono-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{invoice.delivery.driverName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-mono-600">
                    <Truck className="h-4 w-4 mr-2" />
                    <span>{invoice.delivery.vehicleNumber}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-mono-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(invoice)}
                      className="p-2 text-black hover:bg-mono-50 rounded-md"
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(invoice)}
                      className="p-2 text-mono-600 hover:bg-mono-50 rounded-md"
                      title="Дублировать"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePrint(invoice)}
                      className="p-2 text-mono-600 hover:bg-mono-50 rounded-md"
                      title="Печать"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleExportPDF(invoice)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                      title="Экспорт PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="p-2 text-mono-600 hover:bg-mono-50 rounded-md"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            </div>
            
            {/* Пагинация для карточного вида */}
            {totalPages > 1 && (
              <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border border-mono-200 rounded-lg sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Предыдущая
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Следующая
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-mono-700">
                      Показано{' '}
                      <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                      {' '}-{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)}
                      </span>
                      {' '}из{' '}
                      <span className="font-medium">{filteredAndSortedInvoices.length}</span>
                      {' '}результатов
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-mono-300 bg-white text-sm font-medium text-mono-500 hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Номера страниц */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-mono-50 border-mono-500 text-black'
                                  : 'bg-white border-mono-300 text-mono-500 hover:bg-mono-50'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="relative inline-flex items-center px-4 py-2 border border-mono-300 bg-white text-sm font-medium text-mono-700">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-mono-300 bg-white text-sm font-medium text-mono-500 hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}
