import { apiClient } from './client'
import { Counterparty, CreateCounterpartyRequest, UpdateCounterpartyRequest } from '../types/directories'

export const counterpartiesApi = {
  async getAll(): Promise<Counterparty[]> {
    const response = await apiClient.get('/directories/counterparties')
    return response.data
  },

  async getById(id: string): Promise<Counterparty> {
    const response = await apiClient.get(`/directories/counterparties/${id}`)
    return response.data
  },

  async create(data: CreateCounterpartyRequest): Promise<Counterparty> {
    const response = await apiClient.post('/directories/counterparties', data)
    return response.data
  },

  async update(id: string, data: UpdateCounterpartyRequest): Promise<Counterparty> {
    const response = await apiClient.put(`/directories/counterparties/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/directories/counterparties/${id}`)
  }
}
