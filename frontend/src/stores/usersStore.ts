import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '../types/auth'

export interface User {
  id: string
  login: string
  role: UserRole
  fullName?: string
  email?: string
  avatar?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

interface UsersStore {
  users: User[]
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  getUser: (id: string) => User | undefined
  getUserByLogin: (login: string) => User | undefined
  getActiveUsers: () => User[]
  getUsersByRole: (role: UserRole) => User[]
}

export const useUsersStore = create<UsersStore>()(
  persist(
    (set, get) => ({
      users: [],
      
      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        set((state) => ({
          users: [...state.users, newUser]
        }))
      },
      
      updateUser: (id, userData) => {
        set((state) => ({
          users: state.users.map(user =>
            user.id === id
              ? { ...user, ...userData, updatedAt: new Date().toISOString() }
              : user
          )
        }))
      },
      
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter(user => user.id !== id)
        }))
      },
      
      getUser: (id) => {
        return get().users.find(user => user.id === id)
      },
      
      getUserByLogin: (login) => {
        return get().users.find(user => user.login === login)
      },
      
      getActiveUsers: () => {
        return get().users.filter(user => user.isActive !== false)
      },
      
      getUsersByRole: (role) => {
        return get().users.filter(user => user.role === role)
      }
    }),
    {
      name: 'users-storage',
      version: 1
    }
  )
)
