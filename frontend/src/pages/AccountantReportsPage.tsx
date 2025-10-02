import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import PageLayout from '../components/PageLayout'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
    FileText,
    Download,
    Calendar,
    DollarSign,
    TrendingUp,
    Package,
    Users,
    Truck,
    BarChart3,
    PieChart,
    Filter,
    Search
} from 'lucide-react'

// Типы для отчетов
interface FinancialReport {
    id: string
    period: string
    totalRevenue: number
    totalExpenses: number
    profit: number
    ordersCount: number
    averageOrderValue: number
    topCustomers: CustomerStat[]
    monthlyData: MonthlyData[]
    createdAt: string
}

interface CustomerStat {
    id: string
    name: string
    totalOrders: number
    totalAmount: number
    percentage: number
}

interface MonthlyData {
    month: string
    revenue: number
    expenses: number
    profit: number
    ordersCount: number
}

interface ExpenseReport {
    id: string
    category: string
    amount: number
    description: string
    date: string
    approvedBy: string
}

export default function AccountantReportsPage() {
    const { user } = useAuthStore()
    const [selectedPeriod, setSelectedPeriod] = useState('current-month')
    const [reportType, setReportType] = useState<'financial' | 'expenses' | 'customers'>('financial')
    const [searchTerm, setSearchTerm] = useState('')

    // Проверяем права доступа - бухгалтер, директор и разработчик
    const canAccessReports = user?.role === 'accountant' || user?.role === 'director' || user?.role === 'developer'

    if (!canAccessReports) {
        return (
            <PageLayout title="Отчеты">
                <div className="p-8 text-center">
                    <div className="bg-mono-50 border border-mono-200 rounded-lg p-6 max-w-md mx-auto">
                        <div className="text-mono-600 text-6xl mb-4">⛔</div>
                        <h2 className="text-xl font-semibold text-black mb-2">Доступ запрещён</h2>
                        <p className="text-mono-600">
                            У вас нет прав для просмотра отчетов. Доступ разрешён только для бухгалтеров и директоров.
                        </p>
                    </div>
                </div>
            </PageLayout>
        )
    }

    // Мокированные данные для отчетов
    const mockFinancialReport: FinancialReport = {
        id: '1',
        period: 'Декабрь 2024',
        totalRevenue: 15750000, // 15,750,000 тенге
        totalExpenses: 8400000, // 8,400,000 тенге
        profit: 7350000, // 7,350,000 тенге
        ordersCount: 245,
        averageOrderValue: 64286, // ~64,286 тенге
        topCustomers: [
            { id: '1', name: 'ТОО "СтройИнвест"', totalOrders: 45, totalAmount: 2890000, percentage: 18.3 },
            { id: '2', name: 'ИП Иванов А.А.', totalOrders: 32, totalAmount: 2100000, percentage: 13.3 },
            { id: '3', name: 'ТОО "МегаСтрой"', totalOrders: 28, totalAmount: 1850000, percentage: 11.7 }
        ],
        monthlyData: [
            { month: 'Октябрь', revenue: 12500000, expenses: 7200000, profit: 5300000, ordersCount: 198 },
            { month: 'Ноябрь', revenue: 14200000, expenses: 7800000, profit: 6400000, ordersCount: 221 },
            { month: 'Декабрь', revenue: 15750000, expenses: 8400000, profit: 7350000, ordersCount: 245 }
        ],
        createdAt: new Date().toISOString()
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'KZT',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleExportReport = () => {
        // Логика экспорта отчета
        console.log('Экспорт отчета:', reportType, selectedPeriod)
    }

    return (
        <PageLayout
            title="Отчеты бухгалтера"
            subtitle="Финансовые отчеты и аналитика"
        >
            <div className="space-y-6">
                {/* Фильтры и управление */}
                <div className="card">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value as any)}
                                className="input-field"
                            >
                                <option value="financial">Финансовый отчет</option>
                                <option value="expenses">Отчет по расходам</option>
                                <option value="customers">Отчет по клиентам</option>
                            </select>

                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="input-field"
                            >
                                <option value="current-month">Текущий месяц</option>
                                <option value="last-month">Прошлый месяц</option>
                                <option value="quarter">Квартал</option>
                                <option value="year">Год</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mono-400" />
                                <input
                                    type="text"
                                    placeholder="Поиск..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10"
                                />
                            </div>
                            <button
                                onClick={handleExportReport}
                                className="btn-primary flex items-center space-x-2"
                            >
                                <Download className="h-4 w-4" />
                                <span>Экспорт</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Основные метрики */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="stats-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="stats-label">Общая выручка</p>
                                <p className="stats-number text-mono-900">
                                    {formatCurrency(mockFinancialReport.totalRevenue)}
                                </p>
                            </div>
                            <div className="p-3 bg-mono-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-black" />
                            </div>
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="stats-label">Общие расходы</p>
                                <p className="stats-number text-mono-700">
                                    {formatCurrency(mockFinancialReport.totalExpenses)}
                                </p>
                            </div>
                            <div className="p-3 bg-mono-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-mono-600" />
                            </div>
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="stats-label">Прибыль</p>
                                <p className="stats-number text-black">
                                    {formatCurrency(mockFinancialReport.profit)}
                                </p>
                            </div>
                            <div className="p-3 bg-black rounded-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="stats-label">Заказов</p>
                                <p className="stats-number text-mono-800">
                                    {mockFinancialReport.ordersCount}
                                </p>
                            </div>
                            <div className="p-3 bg-mono-100 rounded-lg">
                                <Package className="h-6 w-6 text-mono-700" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Детальная информация */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Топ клиенты */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-black flex items-center">
                                <Users className="h-5 w-5 mr-2" />
                                Топ клиенты
                            </h3>
                            <PieChart className="h-5 w-5 text-mono-600" />
                        </div>
                        <div className="space-y-3">
                            {mockFinancialReport.topCustomers.map((customer, index) => (
                                <div key={customer.id} className="flex items-center justify-between p-3 bg-mono-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-black">{customer.name}</p>
                                            <p className="text-sm text-mono-600">{customer.totalOrders} заказов</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-black">{formatCurrency(customer.totalAmount)}</p>
                                        <p className="text-sm text-mono-600">{customer.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Динамика по месяцам */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-black flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Динамика по месяцам
                            </h3>
                            <BarChart3 className="h-5 w-5 text-mono-600" />
                        </div>
                        <div className="space-y-3">
                            {mockFinancialReport.monthlyData.map((month) => (
                                <div key={month.month} className="border border-mono-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-black">{month.month}</h4>
                                        <span className="text-sm text-mono-600">{month.ordersCount} заказов</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <p className="text-mono-600">Выручка</p>
                                            <p className="font-semibold text-mono-800">{formatCurrency(month.revenue)}</p>
                                        </div>
                                        <div>
                                            <p className="text-mono-600">Расходы</p>
                                            <p className="font-semibold text-mono-700">{formatCurrency(month.expenses)}</p>
                                        </div>
                                        <div>
                                            <p className="text-mono-600">Прибыль</p>
                                            <p className="font-semibold text-black">{formatCurrency(month.profit)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Информационный блок */}
                <div className="card-primary">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-black rounded-lg">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-black mb-2">Отчеты бухгалтера</h4>
                            <p className="text-mono-700 leading-relaxed mb-4">
                                Здесь вы можете просматривать и анализировать финансовые показатели компании,
                                отслеживать динамику доходов и расходов, анализировать эффективность работы с клиентами.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-semibold text-black mb-2">Доступные отчеты:</h5>
                                    <ul className="space-y-1 text-sm text-mono-600">
                                        <li>• Финансовый отчет</li>
                                        <li>• Отчет по расходам</li>
                                        <li>• Анализ клиентской базы</li>
                                        <li>• Динамика продаж</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-black mb-2">Экспорт данных:</h5>
                                    <ul className="space-y-1 text-sm text-mono-600">
                                        <li>• Excel (.xlsx)</li>
                                        <li>• PDF отчеты</li>
                                        <li>• CSV для анализа</li>
                                        <li>• Печатные формы</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}