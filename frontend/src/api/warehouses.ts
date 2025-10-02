import { apiClient } from './client'
import { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from '../types/directories'

export const warehousesApi = {
  async getAll(): Promise<Warehouse[]> {
    const response = await apiClient.get('/directories/warehouses')
    return response.data
  },

  async getById(id: string): Promise<Warehouse> {
    const response = await apiClient.get(`/directories/warehouses/${id}`)
    return response.data
  },

  async create(data: CreateWarehouseRequest): Promise<Warehouse> {
    const response = await apiClient.post('/directories/warehouses', data)
    return response.data
  },

  async update(id: string, data: UpdateWarehouseRequest): Promise<Warehouse> {
    const response = await apiClient.put(`/directories/warehouses/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/directories/warehouses/${id}`)
  }
}
