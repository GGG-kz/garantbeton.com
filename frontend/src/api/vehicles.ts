import { apiClient } from './client'
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '../types/directories'

export const vehiclesApi = {
  async getAll(): Promise<Vehicle[]> {
    const response = await apiClient.get('/directories/vehicles')
    return response.data
  },

  async getById(id: string): Promise<Vehicle> {
    const response = await apiClient.get(`/directories/vehicles/${id}`)
    return response.data
  },

  async create(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await apiClient.post('/directories/vehicles', data)
    return response.data
  },

  async update(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await apiClient.put(`/directories/vehicles/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/directories/vehicles/${id}`)
  }
}
