export interface AdditionalService {
  id: string
  name: string
  price: number
  unit: string // 'per_m3' | 'per_hour' | 'fixed'
}

export interface OrderAdditionalService {
  serviceId: string
  serviceName: string
  pricePerUnit: number
  unit: 'per_m3' | 'per_hour' | 'per_order' | 'fixed'
  quantity: number
  total: number
}

export interface ConcreteOrder {
  id: string
  customerId: string // ID контрагента
  customerName: string // Название контрагента
  concreteGradeId: string // ID марки бетона
  concreteGradeName: string // Название марки бетона
  quantity: number // Количество в м³
  warehouseId: string // ID склада
  warehouseName: string // Название склада
  deliveryObject: string // Объект доставки
  deliveryAddress: string // Адрес доставки
  deliveryDateTime: string // Дата и время доставки
  price?: number // Цена за м³ (скрыто от всех кроме директора/бухгалтера)
  totalPrice?: number // Общая цена (скрыто от всех кроме директора/бухгалтера)
  additionalServices: OrderAdditionalService[] // Дополнительные услуги
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
  createdBy: string // ID пользователя, создавшего заказ
  createdByName: string // Имя пользователя, создавшего заказ
  createdAt: string
  updatedAt: string
  isActive: boolean
  // Поля для отслеживания выполнения заказа
  assignedDriverId?: string // ID назначенного водителя
  assignedDriverName?: string // Имя назначенного водителя
  assignedVehicleId?: string // ID назначенного транспорта
  assignedVehicleNumber?: string // Номер назначенного транспорта
  departureTime?: string // Время отправления с завода
  arrivalTime?: string // Время прибытия на объект
  completionTime?: string // Время завершения доставки
  expenseInvoiceId?: string // ID связанной расходной накладной
}

export interface CreateOrderRequest {
  customerId: string
  concreteGradeId: string
  quantity: number
  warehouseId: string
  deliveryObject: string
  deliveryAddress: string
  deliveryDateTime: string
  price?: number
  additionalServices: OrderAdditionalService[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
}

export interface UpdateOrderRequest {
  customerId?: string
  concreteGradeId?: string
  quantity?: number
  warehouseId?: string
  deliveryObject?: string
  deliveryAddress?: string
  deliveryDateTime?: string
  price?: number
  additionalServices?: OrderAdditionalService[]
  status?: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'completed' | 'cancelled'
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent'

// Статусы заказов
export const ORDER_STATUSES = {
  pending: 'На рассмотрении',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов к отгрузке',
  delivered: 'Доставлен',
  completed: 'Завершён',
  cancelled: 'Отменён'
} as const

// Приоритеты заказов
export const ORDER_PRIORITIES = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный'
} as const

// Цвета для статусов
export const ORDER_STATUS_COLORS = {
  pending: 'bg-mono-100 text-mono-800',
  confirmed: 'bg-mono-200 text-mono-900',
  in_production: 'bg-mono-300 text-black',
  ready: 'bg-mono-400 text-black',
  delivered: 'bg-mono-500 text-white',
  completed: 'bg-black text-white',
  cancelled: 'bg-mono-600 text-white'
} as const

// Цвета для приоритетов
export const ORDER_PRIORITY_COLORS = {
  low: 'bg-mono-100 text-mono-800',
  medium: 'bg-mono-300 text-black',
  high: 'bg-mono-600 text-white',
  urgent: 'bg-black text-white'
} as const

// Пустой массив для дополнительных услуг - данные хранятся в localStorage
export const EMPTY_ADDITIONAL_SERVICES: AdditionalService[] = []
