import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Driver {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  login: string
  phone: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

interface DriversStore {
  drivers: Driver[]
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt'>) => void
  updateDriver: (id: string, driver: Partial<Driver>) => void
  deleteDriver: (id: string) => void
  getDriver: (id: string) => Driver | undefined
  getActiveDrivers: () => Driver[]
}

export const useDriversStore = create<DriversStore>()(
  persist(
    (set, get) => ({
      drivers: [],
      
      addDriver: (driverData) => {
        const newDriver: Driver = {
          ...driverData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        set((state) => ({
          drivers: [...state.drivers, newDriver]
        }))
      },
      
      updateDriver: (id, driverData) => {
        set((state) => ({
          drivers: state.drivers.map(driver =>
            driver.id === id
              ? { ...driver, ...driverData, updatedAt: new Date().toISOString() }
              : driver
          )
        }))
      },
      
      deleteDriver: (id) => {
        set((state) => ({
          drivers: state.drivers.filter(driver => driver.id !== id)
        }))
      },
      
      getDriver: (id) => {
        return get().drivers.find(driver => driver.id === id)
      },
      
      getActiveDrivers: () => {
        return get().drivers.filter(driver => driver.isActive)
      }
    }),
    {
      name: 'drivers-storage',
      version: 1
    }
  )
)
