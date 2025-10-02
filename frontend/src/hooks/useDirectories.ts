import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'

export function useDirectories<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get(endpoint)
      setData(response.data)
    } catch (err) {
      console.error(`Ошибка загрузки ${endpoint}:`, err)
      setError(`Не удалось загрузить данные`)
    } finally {
      setLoading(false)
    }
  }

  const createItem = async (itemData: any) => {
    try {
      await apiClient.post(endpoint, itemData)
      await loadData()
    } catch (err) {
      console.error(`Ошибка создания в ${endpoint}:`, err)
      throw err
    }
  }

  const updateItem = async (id: string, itemData: any) => {
    try {
      await apiClient.put(`${endpoint}/${id}`, itemData)
      await loadData()
    } catch (err) {
      console.error(`Ошибка обновления в ${endpoint}:`, err)
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await apiClient.delete(`${endpoint}/${id}`)
      await loadData()
    } catch (err) {
      console.error(`Ошибка удаления в ${endpoint}:`, err)
      throw err
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    data,
    loading,
    error,
    loadData,
    createItem,
    updateItem,
    deleteItem
  }
}

