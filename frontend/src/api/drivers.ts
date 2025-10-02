import { apiClient } from './client'
import { Driver, CreateDriverRequest, UpdateDriverRequest } from '../types/directories'

export const driversApi = {
  async getAll(): Promise<Driver[]> {
    const response = await apiClient.get('/directories/drivers')
    return response.data
  },

  async getById(id: string): Promise<Driver> {
    const response = await apiClient.get(`/directories/drivers/${id}`)
    return response.data
  },

  async create(data: CreateDriverRequest): Promise<Driver> {
    const response = await apiClient.post('/directories/drivers', data)
    return response.data
  },

  async update(id: string, data: UpdateDriverRequest): Promise<Driver> {
    const response = await apiClient.put(`/directories/drivers/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/directories/drivers/${id}`)
  }
}
