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
            isDeveloper: response.user.role === UserRole.DEVELOPER,
            originalRole
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
          set({ 
            isAuthenticated: true,
            // Восстанавливаем originalRole если пользователь разработчик
            originalRole: state.user.role === UserRole.DEVELOPER ? UserRole.DEVELOPER : (state.originalRole || null)
          })
        }
      },

      switchRole: (role: UserRole) => {
        const state = get()
        // Разрешаем переключение ролей только если пользователь разработчик (по исходной роли)
        const isDeveloper = state.user?.originalRole === UserRole.DEVELOPER || state.user?.role === UserRole.DEVELOPER
        if (state.user && isDeveloper) {
          set({
            user: {
              ...state.user,
              role,
            },
          })
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