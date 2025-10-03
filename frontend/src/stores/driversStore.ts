import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '../types/auth'

export interface Driver {
  id: string
  fullName: string
  login: string
  password: string
  phone: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
  userId?: string // Ссылка на пользователя
}

interface DriversStore {
  drivers: Driver[]
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'userId'>) => Promise<void>
  updateDriver: (id: string, driver: Partial<Driver>) => void
  deleteDriver: (id: string) => void
  getDriver: (id: string) => Driver | undefined
  getActiveDrivers: () => Driver[]
}

export const useDriversStore = create<DriversStore>()(
  persist(
    (set, get) => ({
      drivers: [],
      
      addDriver: async (driverData) => {
        try {
          // Регистрируем водителя в бэкенде
          const driverRegistrationData = {
            id: Date.now().toString(),
            login: driverData.login,
            tempPassword: driverData.password || 'TempPass123',
            fullName: driverData.fullName,
            status: driverData.isActive ? 'active' : 'inactive'
          }

          const response = await fetch('/api/auth/driver/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(driverRegistrationData)
          })

          if (!response.ok) {
            throw new Error('Ошибка регистрации водителя')
          }

          // Создаем пользователя автоматически
          const userId = Date.now().toString()
          
          // Добавляем пользователя в localStorage (эмулируем создание пользователя)
          const existingUsers = JSON.parse(localStorage.getItem('users-storage') || '{"state":{"users":[]}}')
          const newUser = {
            id: userId,
            login: driverData.login,
            role: UserRole.DRIVER,
            fullName: driverData.fullName,
            email: '',
            isActive: driverData.isActive,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          existingUsers.state.users.push(newUser)
          localStorage.setItem('users-storage', JSON.stringify(existingUsers))
          
          // Создаем водителя
          const newDriver: Driver = {
            ...driverData,
            id: Date.now().toString(),
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          set((state) => ({
            drivers: [...state.drivers, newDriver]
          }))
        } catch (error) {
          console.error('Ошибка при создании водителя:', error)
          throw error
        }
      },
      
      updateDriver: (id, driverData) => {
        const driver = get().drivers.find(d => d.id === id)
        if (driver && driver.userId) {
          // Обновляем пользователя
          const existingUsers = JSON.parse(localStorage.getItem('users-storage') || '{"state":{"users":[]}}')
          const userIndex = existingUsers.state.users.findIndex((u: any) => u.id === driver.userId)
          if (userIndex !== -1) {
            existingUsers.state.users[userIndex] = {
              ...existingUsers.state.users[userIndex],
              login: driverData.login || existingUsers.state.users[userIndex].login,
              fullName: driverData.fullName || existingUsers.state.users[userIndex].fullName,
              isActive: driverData.isActive !== undefined ? driverData.isActive : existingUsers.state.users[userIndex].isActive,
              updatedAt: new Date().toISOString()
            }
            localStorage.setItem('users-storage', JSON.stringify(existingUsers))
          }
        }
        
        set((state) => ({
          drivers: state.drivers.map(driver =>
            driver.id === id
              ? { ...driver, ...driverData, updatedAt: new Date().toISOString() }
              : driver
          )
        }))
      },
      
      deleteDriver: (id) => {
        const driver = get().drivers.find(d => d.id === id)
        if (driver && driver.userId) {
          // Удаляем пользователя
          const existingUsers = JSON.parse(localStorage.getItem('users-storage') || '{"state":{"users":[]}}')
          existingUsers.state.users = existingUsers.state.users.filter((u: any) => u.id !== driver.userId)
          localStorage.setItem('users-storage', JSON.stringify(existingUsers))
        }
        
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
