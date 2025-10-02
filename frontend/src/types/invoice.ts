export interface InvoiceItem {
  id: string
  number: number // автонумерация
  productCode: string // код товара
  productName: string // наименование товара
  quantity: number // количество (формат 0,000)
  price?: number // цена (только для бухгалтера/директора)
  amount?: number // сумма (авто-расчёт, скрыта от диспетчера)
  // Расходы материалов (автозаполнение из справочника марки бетона)
  cementConsumption?: number // расход цемента за 1 м³ (кг)
  gravelConsumption?: number // расход щебня за 1 м³ (кг)
  sandConsumption?: number // расход песка за 1 м³ (кг)
  plasticizerConsumption?: number // расход пластификатора за 1 м³ (л)
}

export interface DeliveryInfo {
  deliveryObject: string // объект доставки
  deliveryAddress: string // адрес доставки (скопированный из 2ГИС)
  dispatcher: string // диспетчер (подставляется по логину)
  driverId: string // водитель (из справочника)
  driverName: string
  vehicleId: string // номер автомобиля (из справочника)
  vehicleNumber: string
  netWeight?: number // вес нетто, тонн
  grossWeight?: number // вес брутто, тонн
  coneSlump?: number // осадка конуса
  dailyVolume?: number // объём с нач. дня (куб.м)
}

export interface VehicleTiming {
  departureFromPlant: string // время убытия с завода (диспетчер устанавливает)
  departureFromPlantDriver?: string // время убытия с завода (водитель подтверждает)
  arrivalAtObject?: string // время прибытия на объект (водитель устанавливает)
  departureFromObject?: string // время убытия с объекта (водитель устанавливает)
  arrivalAtPlant?: string // время прибытия на завод (водитель устанавливает)
}

export type InvoiceStatus = 'pending' | 'delivered' | 'rejected' | 'completed'

export interface InvoiceDriverActions {
  departureConfirmed?: boolean // водитель подтвердил убытие
  arrivalConfirmed?: boolean // водитель подтвердил прибытие
  departureFromObjectConfirmed?: boolean // водитель подтвердил убытие с объекта
  arrivalAtPlantConfirmed?: boolean // водитель подтвердил прибытие на завод
  // Время, установленное водителем
  departureFromPlantDriver?: string // время убытия с завода (водитель подтверждает)
  arrivalAtObject?: string // время прибытия на объект (водитель устанавливает)
  departureFromObject?: string // время убытия с объекта (водитель устанавливает)
  arrivalAtPlant?: string // время прибытия на завод (водитель устанавливает)
  invoiceStatus?: InvoiceStatus // статус накладной
  rejectionReason?: string // причина отказа (если не приняли)
  driverNotes?: string // заметки водителя
  completedAt?: string // время завершения доставки
}

export interface ExpenseInvoice {
  id: string
  invoiceNumber: string // номер накладной (авто-генерация с датой)
  invoiceDate: string // дата накладной
  supplier: string // поставщик (фиксированное "ТОО "Микс Бетон"")
  customerId: string // покупатель (из справочника)
  customerName: string
  contract: string // договор (по умолчанию "Без договора")
  seal: string // пломба
  warehouseId: string // склад (из справочника)
  warehouseName: string
  items: InvoiceItem[] // таблица товаров
  delivery: DeliveryInfo // блок доставки
  timing: VehicleTiming // время движения автомобиля
  driverActions?: InvoiceDriverActions // действия водителя
  total?: number // итого (только для бухгалтера)
  vatAmount?: number // НДС
  releasedBy: string // выпустил (ФИО/роль)
  receivedBy: string // получено (пустое поле для подписи)
  createdAt: string
  updatedAt: string
  orderId?: string // ID связанного заказа
  createdBy: string
  createdByName: string
  isActive: boolean
}

export type CreateInvoiceRequest = Omit<ExpenseInvoice, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName' | 'isActive'> & {
  invoiceNumber: string
}

export type UpdateInvoiceRequest = Partial<CreateInvoiceRequest>

// Константы для генерации номера накладной
export const INVOICE_PREFIX = 'РН' // Расходная Накладная
export const INVOICE_SUPPLIER = 'ТОО "Микс Бетон"' // Фиксированный поставщик
export const INVOICE_DEFAULT_CONTRACT = 'Без договора' // Договор по умолчанию
