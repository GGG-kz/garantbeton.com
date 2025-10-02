export interface InternalRequest {
  id: string
  userId: string
  userName: string
  userRole: string // Роль пользователя, создавшего заявку
  category: RequestCategory
  title: string
  description: string
  quantity?: number
  unit?: string
  status: RequestStatus
  priority: RequestPriority
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
  completedBy?: string
  completedAt?: string
  paidBy?: string
  paidAt?: string
  receivedBy?: string
  receivedAt?: string
  notes?: string
  // Новые поля для снабженца
  counterpartyId?: string
  counterpartyName?: string
  price?: number
  currency?: 'KZT'
  isActive: boolean
}

export type RequestCategory = 
  | 'office_supplies'    // Канцелярские товары
  | 'it_equipment'       // IT оборудование
  | 'furniture'          // Мебель
  | 'repairs'            // Ремонт
  | 'cleaning'           // Уборка
  | 'catering'           // Питание
  | 'transport'          // Транспорт
  | 'other'              // Прочее

export type RequestStatus = 
  | 'pending'            // На рассмотрении
  | 'priced'             // Цена указана (снабженец указал цену)
  | 'approved'           // Одобрено директором
  | 'paid'               // Оплачено бухгалтером
  | 'rejected'           // Отклонено
  | 'completed'          // Выполнено
  | 'received'           // Получено заявителем

export type RequestPriority = 
  | 'low'                // Низкий
  | 'medium'             // Средний
  | 'high'               // Высокий
  | 'urgent'             // Срочный

export type CreateRequestRequest = Omit<InternalRequest, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'userRole' | 'approvedBy' | 'approvedAt' | 'completedBy' | 'completedAt' | 'isActive'>

export type UpdateRequestRequest = Partial<Pick<InternalRequest, 'status' | 'approvedBy' | 'approvedAt' | 'completedBy' | 'completedAt' | 'notes'>>

// Константы для UI
export const REQUEST_CATEGORIES = {
  office_supplies: 'Канцелярские товары',
  it_equipment: 'IT оборудование',
  furniture: 'Мебель',
  repairs: 'Ремонт',
  cleaning: 'Уборка',
  catering: 'Питание',
  transport: 'Транспорт',
  other: 'Прочее'
} as const

export const REQUEST_STATUSES = {
  pending: 'На рассмотрении',
  priced: 'Цена указана',
  approved: 'Одобрено директором',
  paid: 'Оплачено',
  rejected: 'Отклонено',
  completed: 'Выполнено',
  received: 'Получено заявителем'
} as const

export const REQUEST_PRIORITIES = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный'
} as const

export const STATUS_COLORS = {
  pending: 'bg-mono-100 text-mono-800',
  priced: 'bg-mono-200 text-mono-900',
  approved: 'bg-mono-300 text-black',
  paid: 'bg-mono-400 text-black',
  rejected: 'bg-mono-600 text-white',
  completed: 'bg-black text-white',
  received: 'bg-mono-500 text-white'
} as const

export const PRIORITY_COLORS = {
  low: 'bg-mono-100 text-mono-800',
  medium: 'bg-mono-300 text-black',
  high: 'bg-mono-600 text-white',
  urgent: 'bg-black text-white'
} as const
