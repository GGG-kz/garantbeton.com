import { apiClient } from './client'
import { Material, CreateMaterialRequest, UpdateMaterialRequest } from '../types/directories'

export const materialsApi = {
  async getAll(): Promise<Material[]> {
    const response = await apiClient.get('/directories/materials')
    return response.data
  },

  async getById(id: string): Promise<Material> {
    const response = await apiClient.get(`/directories/materials/${id}`)
    return response.data
  },

  async create(data: CreateMaterialRequest): Promise<Material> {
    const response = await apiClient.post('/directories/materials', data)
    return response.data
  },

  async update(id: string, data: UpdateMaterialRequest): Promise<Material> {
    const response = await apiClient.put(`/directories/materials/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/directories/materials/${id}`)
  }
}
