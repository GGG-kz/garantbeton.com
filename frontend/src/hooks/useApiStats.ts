import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'

interface ApiStats {
  counterparties: { total: number; active: number }
  concreteGrades: { total: number; active: number }
  warehouses: { total: number; active: number }
  materials: { total: number; active: number }
  drivers: { total: number; active: number }
  vehicles: { total: number; active: number }
}

export const useApiStats = () => {
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.get('/directories/stats')
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Ошибка загрузки статистики')
      // Устанавливаем пустую статистику при ошибке
      setStats({
        counterparties: { total: 0, active: 0 },
        concreteGrades: { total: 0, active: 0 },
        warehouses: { total: 0, active: 0 },
        materials: { total: 0, active: 0 },
        drivers: { total: 0, active: 0 },
        vehicles: { total: 0, active: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const refresh = () => {
    fetchStats()
  }

  return {
    stats,
    loading,
    error,
    refresh
  }
}
