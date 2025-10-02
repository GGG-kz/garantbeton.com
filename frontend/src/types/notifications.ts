export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string // кому предназначено уведомление
  role?: string // роль пользователя (для групповых уведомлений)
  relatedOrderId?: string // связанный заказ
  relatedInvoiceId?: string // связанная накладная
  isRead: boolean
  createdAt: string
  priority: 'low' | 'medium' | 'high'
  actions?: NotificationAction[]
}

export interface NotificationAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: string // действие при клике
}

export type NotificationType = 
  | 'order_status_changed'
  | 'order_completed'
  | 'order_cancelled'
  | 'invoice_created'
  | 'driver_action'
  | 'system_alert'

export const NOTIFICATION_TEMPLATES = {
  order_status_changed: (orderId: string, oldStatus: string, newStatus: string, driverName?: string) => ({
    title: 'Статус заказа изменен',
    message: `Заказ #${orderId} изменен с "${oldStatus}" на "${newStatus}"${driverName ? ` водителем ${driverName}` : ''}`,
    type: 'info' as const,
    priority: 'medium' as const
  }),
  order_completed: (orderId: string, driverName: string, customerName: string) => ({
    title: 'Заказ выполнен',
    message: `Заказ #${orderId} успешно выполнен водителем ${driverName} для ${customerName}`,
    type: 'success' as const,
    priority: 'high' as const
  }),
  order_cancelled: (orderId: string, driverName: string, reason?: string) => ({
    title: 'Заказ отменен',
    message: `Заказ #${orderId} отменен водителем ${driverName}${reason ? `. Причина: ${reason}` : ''}`,
    type: 'warning' as const,
    priority: 'high' as const
  }),
  driver_departure: (orderId: string, driverName: string, vehicleNumber: string) => ({
    title: 'Водитель выехал',
    message: `Водитель ${driverName} (${vehicleNumber}) выехал с заказа #${orderId}`,
    type: 'info' as const,
    priority: 'medium' as const
  }),
  driver_arrival: (orderId: string, driverName: string, customerName: string) => ({
    title: 'Водитель прибыл',
    message: `Водитель ${driverName} прибыл к заказчику ${customerName} (заказ #${orderId})`,
    type: 'info' as const,
    priority: 'medium' as const
  })
}

export const ROLES_TO_NOTIFY = {
  'order_status_changed': ['dispatcher', 'accountant', 'director', 'manager'],
  'order_completed': ['dispatcher', 'accountant', 'director', 'manager'],
  'order_cancelled': ['dispatcher', 'accountant', 'director', 'manager'],
  'driver_departure': ['dispatcher', 'director'],
  'driver_arrival': ['dispatcher', 'director']
}

