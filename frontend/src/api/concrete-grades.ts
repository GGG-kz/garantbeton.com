import { apiClient } from './client'
import { ConcreteGrade, CreateConcreteGradeRequest, UpdateConcreteGradeRequest } from '../types/directories'

export const concreteGradesApi = {
  async getAll(): Promise<ConcreteGrade[]> {
    const response = await apiClient.get('/directories/concrete-grades')
    return response.data
  },

  async getById(id: string): Promise<ConcreteGrade> {
    const response = await apiClient.get(`/directories/concrete-grades/${id}`)
    return response.data
  },

  async create(data: CreateConcreteGradeRequest): Promise<ConcreteGrade> {
    const response = await apiClient.post('/directories/concrete-grades', data)
    return response.data
  },

  async update(id: string, data: UpdateConcreteGradeRequest): Promise<ConcreteGrade> {
    const response = await apiClient.put(`/directories/concrete-grades/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/directories/concrete-grades/${id}`)
  }
}
