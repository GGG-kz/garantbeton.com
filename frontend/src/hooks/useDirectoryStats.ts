import { useLocalStorage } from './useLocalStorage'
import { Counterparty, ConcreteGrade, Warehouse, Material, Driver, Vehicle } from '../types/directories'
import { ConcreteOrder } from '../types/orders'
import { ExpenseInvoice } from '../types/invoice'
import { InternalRequest } from '../types/requests'
import { AdditionalService } from '../types/orders'
import { Price } from '../types/directories'
import { AdminUser } from '../types/admin'

export interface DirectoryStats {
  total: number
  active: number
}

export interface AllStats {
  counterparties: DirectoryStats
  concreteGrades: DirectoryStats
  warehouses: DirectoryStats
  materials: DirectoryStats
  drivers: DirectoryStats
  vehicles: DirectoryStats
  orders: DirectoryStats
  expenseInvoices: DirectoryStats
  internalRequests: DirectoryStats
  additionalServices: DirectoryStats
  prices: DirectoryStats
  adminUsers: DirectoryStats
  servicePrices: DirectoryStats
}

/**
 * Хук для получения динамической статистики всех справочников
 * Автоматически подсчитывает количество записей из localStorage
 */
export function useDirectoryStats(): AllStats {
  // Получаем все данные из localStorage
  const [counterparties] = useLocalStorage<Counterparty[]>('counterparties', [])
  const [concreteGrades] = useLocalStorage<ConcreteGrade[]>('concreteGrades', [])
  const [warehouses] = useLocalStorage<Warehouse[]>('warehouses', [])
  const [materials] = useLocalStorage<Material[]>('materials', [])
  const [drivers] = useLocalStorage<Driver[]>('drivers', [])
  const [vehicles] = useLocalStorage<Vehicle[]>('vehicles', [])
  const [orders] = useLocalStorage<ConcreteOrder[]>('orders', [])
  const [expenseInvoices] = useLocalStorage<ExpenseInvoice[]>('expenseInvoices', [])
  const [internalRequests] = useLocalStorage<InternalRequest[]>('internalRequests', [])
  const [additionalServices] = useLocalStorage<AdditionalService[]>('additionalServices', [])
  const [prices] = useLocalStorage<Price[]>('prices', [])
  const [adminUsers] = useLocalStorage<AdminUser[]>('adminUsers', [])
  const [servicePrices] = useLocalStorage<AdditionalService[]>('servicePrices', [])

  // Функция для подсчета статистики
  const getStats = (data: any[]): DirectoryStats => ({
    total: data.length,
    active: data.filter(item => item.isActive !== false).length
  })

  return {
    counterparties: getStats(counterparties),
    concreteGrades: getStats(concreteGrades),
    warehouses: getStats(warehouses),
    materials: getStats(materials),
    drivers: getStats(drivers),
    vehicles: getStats(vehicles),
    orders: getStats(orders),
    expenseInvoices: getStats(expenseInvoices),
    internalRequests: getStats(internalRequests),
    additionalServices: getStats(additionalServices),
    prices: getStats(prices),
    adminUsers: getStats(adminUsers),
    servicePrices: getStats(servicePrices),
  }
}

/**
 * Хук для получения статистики конкретного справочника
 * @param storageKey - ключ в localStorage
 */
export function useSingleDirectoryStats(storageKey: string): DirectoryStats {
  const allStats = useDirectoryStats()
  return allStats[storageKey as keyof AllStats] || { total: 0, active: 0 }
}
