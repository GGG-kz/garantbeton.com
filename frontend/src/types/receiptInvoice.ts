// Типы для приходных накладных

export interface ReceiptInvoiceItem {
  id: string
  vehicleNumber: string // гос. номер машины
  supplier: string // поставщик
  buyer: string // покупатель
  material: string // материал
  
  // Взвешивание
  bruttoWeight?: number // вес брутто
  bruttoDateTime?: string // дата/время взвешивания брутто
  taraWeight?: number // вес тары
  taraDateTime?: string // дата/время взвешивания тары
  netWeight?: number // нетто (автоматически: брутто - тара)
  
  // Влажность
  humidity?: number // влажность в процентах
  finalWeight?: number // итоговый вес (нетто - влажность)
  
  // Статус взвешивания
  weighingStatus: 'pending' | 'brutto_done' | 'tara_done' | 'completed'
}

export interface ReceiptInvoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  warehouse: string // склад
  
  // Основная информация
  contract?: string // договор
  seal?: string // печать
  
  // Позиции (каждая позиция = одна машина)
  items: ReceiptInvoiceItem[]
  
  // Ответственные лица
  receivedBy: string // принял (ФИО/должность)
  issuedBy: string // выписал (ФИО поставщика)
  
  // Статус
  status: 'draft' | 'in_progress' | 'completed'
  
  // Системные поля
  createdAt: string
  updatedAt: string
  createdBy: string
  isActive: boolean
}

export interface CreateReceiptInvoiceRequest {
  invoiceNumber: string
  invoiceDate: string
  warehouse: string
  contract?: string
  seal?: string
  items: Omit<ReceiptInvoiceItem, 'id'>[]
  receivedBy: string
  issuedBy: string
}

// Типы для черновиков взвешивания
export interface WeighingDraft {
  id: string
  vehicleNumber: string // гос. номер
  bruttoWeight: number // вес брутто
  bruttoDateTime: string // дата/время взвешивания брутто
  taraWeight?: number // вес тары (после выезда)
  taraDateTime?: string // дата/время взвешивания тары
  netWeight?: number // нетто (автоматически: брутто - тара)
  
  // Данные для завершения
  supplier?: string // поставщик
  recipient?: string // получатель
  cargo?: string // груз
  warehouse?: string // склад
  
  // Статус
  status: 'draft' | 'completed' // черновик или завершен
  
  // Системные поля
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface CreateWeighingDraftRequest {
  vehicleNumber: string
  bruttoWeight: number
  bruttoDateTime: string
  createdBy: string
}

// Тестовые данные для проверки фильтрации по пользователям
export const emptyReceiptInvoices: ReceiptInvoice[] = [
  // Накладная водителя driver1
  {
    id: 'invoice-1',
    invoiceNumber: 'ПН-20241201-001',
    invoiceDate: '2024-12-01',
    warehouse: 'Склад А',
    seal: 'Печать 1',
    items: [
      {
        id: 'item-1',
        vehicleNumber: '01ABC123',
        supplier: 'supplier-1',
        buyer: 'client-1',
        material: 'material-1',
        weighingStatus: 'completed'
      }
    ],
    receivedBy: 'driver1',
    issuedBy: 'Поставщик 1',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'driver1', // Создана водителем driver1
    isActive: true
  },
  // Накладная водителя driver2
  {
    id: 'invoice-2',
    invoiceNumber: 'ПН-20241201-002',
    invoiceDate: '2024-12-01',
    warehouse: 'Склад Б',
    seal: 'Печать 2',
    items: [
      {
        id: 'item-2',
        vehicleNumber: '02DEF456',
        supplier: 'supplier-2',
        buyer: 'client-2',
        material: 'material-2',
        weighingStatus: 'pending'
      }
    ],
    receivedBy: 'driver2',
    issuedBy: 'Поставщик 2',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'driver2', // Создана водителем driver2
    isActive: true
  }
]
export const emptyWeighingDrafts: WeighingDraft[] = []

