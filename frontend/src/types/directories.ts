// Временные типы для справочников - будут пересозданы завтра

export interface BaseDirectoryItem {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Counterparty extends BaseDirectoryItem {
  type: 'client' | 'supplier'
  organizationType: 'legal' | 'individual'
  fullName: string
  iin?: string
  bin?: string
  address?: string
  phone?: string
  email?: string
  contactPerson?: string
  notes?: string
  autoApprove?: boolean
}

export interface ConcreteGrade extends BaseDirectoryItem {
  grade: string
  code?: string
  description?: string
  cementConsumption?: number
  gravelConsumption?: number
  sandConsumption?: number
  plasticizerConsumption?: number
}

export interface Warehouse extends BaseDirectoryItem {
  address: string
  coordinates?: string
  phone?: string
  materials: string[]
  scalesComPort?: string
  scalesModel?: string
  scalesEnabled?: boolean
}

export interface Material extends BaseDirectoryItem {
  type: 'cement' | 'sand' | 'gravel' | 'water' | 'additive'
  unit: 'kg' | 'm3' | 'ton' | 'liter'
}

export interface Driver extends BaseDirectoryItem {
  firstName: string
  lastName: string
  phone: string
  licenseNumber: string
  licenseExpiry: string
  status: 'active' | 'vacation' | 'sick' | 'inactive'
  vehicleIds: string[]
}

export interface Vehicle extends BaseDirectoryItem {
  make: string
  model: string
  year: number
  plateNumber: string
  capacity: number
  status: 'active' | 'maintenance' | 'inactive'
  driverIds: string[]
}

export interface Price extends BaseDirectoryItem {
  concreteGradeId: string
  price: number
  currency: string
  validFrom: string
  validTo?: string
}

// Request types
export type CreateCounterpartyRequest = Omit<Counterparty, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateCounterpartyRequest = Partial<CreateCounterpartyRequest>

export type CreateConcreteGradeRequest = Omit<ConcreteGrade, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateConcreteGradeRequest = Partial<CreateConcreteGradeRequest>

export type CreateWarehouseRequest = Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateWarehouseRequest = Partial<CreateWarehouseRequest>

export type CreateMaterialRequest = Omit<Material, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateMaterialRequest = Partial<CreateMaterialRequest>

export type CreateDriverRequest = Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateDriverRequest = Partial<CreateDriverRequest>

export type CreateVehicleRequest = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateVehicleRequest = Partial<CreateVehicleRequest>
