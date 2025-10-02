import { apiClient } from './client'
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log('🔐 Attempting login with:', credentials)
    console.log('🌐 API Client base URL:', apiClient.defaults.baseURL)
    try {
      const response = await apiClient.post('/auth/login', credentials)
      console.log('✅ Login successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message)
      console.error('🔍 Full error:', error)
      throw error
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile')
    return response.data
  },

  // Вход для водителей
  driverLogin: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/driver/login', credentials)
    return response.data
  },

  // Регистрация водителя
  registerDriver: async (driverData: any): Promise<{ message: string }> => {
    console.log('🚗 Регистрируем водителя:', driverData)
    try {
      const response = await apiClient.post('/auth/driver/register', driverData)
      console.log('✅ Водитель зарегистрирован:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Ошибка регистрации водителя:', error.response?.data || error.message)
      throw error
    }
  },
}
