// Базовый интерфейс для всех записей справочников
export interface BaseDirectoryItem {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Контрагенты (клиенты, поставщики)
export interface Counterparty extends BaseDirectoryItem {
  type: 'client' | 'supplier'
  organizationType: 'legal' | 'individual' // Юридическое лицо или Физическое лицо
  fullName: string
  iin?: string // Индивидуальный идентификационный номер
  bin?: string // Бизнес-идентификационный номер
  address?: string
  phone?: string
  email?: string
  contactPerson?: string
  notes?: string
  autoApprove?: boolean // Автоматическое подтверждение заявок для этого контрагента
}

// Марки бетона
export interface ConcreteGrade extends BaseDirectoryItem {
  grade: string // М100, М200, М300 и т.д.
  code?: string // Код марки бетона
  description?: string
  cementConsumption?: number // Расход цемента за 1 м³ (кг)
  gravelConsumption?: number // Расход щебня за 1 м³ (кг)
  sandConsumption?: number // Расход песка за 1 м³ (кг)
  plasticizerConsumption?: number // Расход пластификатора за 1 м³ (л)
}

// Склады
export interface Warehouse extends BaseDirectoryItem {
  address: string
  coordinates?: string // Координаты (широта, долгота) для карт
  phone?: string
  materials: string[] // ID материалов, которые хранятся на складе
  scalesComPort?: string // COM порт для подключения весов (например, "COM3")
  scalesModel?: string // Модель весов
  scalesEnabled?: boolean // Включены ли весы на этом складе
}

// Материалы
export interface Material extends BaseDirectoryItem {
  type: 'cement' | 'sand' | 'gravel' | 'water' | 'additive'
  unit: 'kg' | 'm3' | 'ton' | 'liter'
}

// Водители
export interface Driver extends BaseDirectoryItem {
  fullName: string
  phone: string
  login: string // Номер телефона как логин
  vehicleIds: string[] // ID закрепленных транспортных средств
  status: 'active' | 'inactive' | 'vacation' | 'sick'
  tempPassword?: string // Временный пароль для входа
  hasChangedPassword?: boolean // Флаг смены пароля водителем
}

// Транспорт
export interface Vehicle extends Omit<BaseDirectoryItem, 'name'> {
  type: 'concrete_mixer' | 'dump_truck'
  model: string
  licensePlate: string
  capacity: number // В м³
  driverId?: string // ID закрепленного водителя
  isHired: boolean // Наемный транспорт
  status: 'available' | 'in_use' | 'in_maintenance'
}

// Типы для форм создания/редактирования
export type CreateCounterpartyRequest = Omit<Counterparty, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
export type UpdateCounterpartyRequest = Partial<CreateCounterpartyRequest>

export type CreateConcreteGradeRequest = Omit<ConcreteGrade, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
export type UpdateConcreteGradeRequest = Partial<CreateConcreteGradeRequest>

export type CreateWarehouseRequest = Omit<Warehouse, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
export type UpdateWarehouseRequest = Partial<CreateWarehouseRequest>

export type CreateMaterialRequest = Omit<Material, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
export type UpdateMaterialRequest = Partial<CreateMaterialRequest>

export type CreateDriverRequest = Omit<Driver, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'status'>
export type UpdateDriverRequest = Partial<CreateDriverRequest>

export type CreateVehicleRequest = Omit<Vehicle, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
export type UpdateVehicleRequest = Partial<CreateVehicleRequest>

// Цены
export interface Price extends BaseDirectoryItem {
  counterpartyId: string // ID контрагента
  counterpartyName: string // Название контрагента (для отображения)
  concreteGradeId?: string // ID марки бетона (опционально)
  concreteGradeName?: string // Название марки бетона (для отображения)
  materialId?: string // ID материала (опционально)
  materialName?: string // Название материала (для отображения)
  price: number // Цена
  currency: 'KZT' // Валюта (тенге)
  validFrom: string // Дата начала действия цены
  validTo?: string // Дата окончания действия цены (опционально)
  notes?: string // Примечания
}

export type CreatePriceRequest = Omit<Price, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'counterpartyName' | 'concreteGradeName' | 'materialName'>
export type UpdatePriceRequest = Partial<CreatePriceRequest>
