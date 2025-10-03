import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/auth'
import { User, UserRole, LoginRequest, RegisterRequest, AuthState } from '../types/auth'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      originalRole: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(credentials)
          const originalRole = response.user.role === UserRole.DEVELOPER ? UserRole.DEVELOPER : null
          console.log('Login debug:', {
            userRole: response.user.role,
            userRoleEnum: UserRole.DEVELOPER,
            isDeveloper: response.user.role === UserRole.DEVELOPER,
            originalRole,
            comparison: response.user.role === UserRole.DEVELOPER
          })
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            // Сохраняем исходную роль разработчика для возможности переключения
            originalRole,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(userData)
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            originalRole: response.user.role === UserRole.DEVELOPER ? UserRole.DEVELOPER : null,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          originalRole: null,
        })
      },

      initializeAuth: () => {
        const state = get()
        if (state.accessToken && state.user) {
          // Если originalRole не установлен, устанавливаем его на основе текущей роли
          const originalRole = state.originalRole || state.user.role
          
          set({ 
            isAuthenticated: true,
            originalRole: originalRole
          })
          
          // Проверяем localStorage напрямую
          const storedAuth = localStorage.getItem('auth-storage')
          const parsedAuth = storedAuth ? JSON.parse(storedAuth) : null
          
          console.log('initializeAuth debug:', {
            user: state.user.login,
            currentRole: state.user.role,
            originalRole: originalRole,
            storedOriginalRole: state.originalRole,
            isDeveloper: originalRole === UserRole.DEVELOPER,
            userRoleEnum: UserRole.DEVELOPER,
            localStorageAuth: parsedAuth,
            localStorageOriginalRole: parsedAuth?.state?.originalRole
          })
        }
      },

      switchRole: (role: UserRole) => {
        const state = get()
        // ВРЕМЕННО: разрешаем переключение ролей ВСЕМ пользователям
        console.log('switchRole debug:', {
          currentRole: state.user?.role,
          originalRole: state.user?.originalRole,
          newRole: role,
          user: state.user?.login
        })
        
        if (state.user) {
          set({
            user: {
              ...state.user,
              role,
            },
            // Сохраняем originalRole при переключении
            originalRole: state.originalRole || state.user.role
          })
          console.log('Role switched successfully to:', role)
        } else {
          console.log('Role switch denied - no user')
        }
      },

      // Вход для водителей
      driverLogin: async (credentials: LoginRequest) => {
        set({ isLoading: true })
        try {
          const response = await authApi.driverLogin(credentials)
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            originalRole: null, // Водители не могут переключать роли
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        originalRole: state.originalRole,
      }),
    }
  )
)