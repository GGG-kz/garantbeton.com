import { useState, useEffect, useCallback } from 'react'

interface CacheOptions {
  ttl?: number // Time to live в миллисекундах
  staleWhileRevalidate?: boolean // Возвращать устаревшие данные пока загружаются новые
  maxAge?: number // Максимальный возраст кэша
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  isStale: boolean
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 минут

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isStale: false
    })

    // Автоматическое удаление через TTL
    if (ttl || this.DEFAULT_TTL) {
      setTimeout(() => {
        const entry = this.cache.get(key)
        if (entry) {
          entry.isStale = true
        }
      }, ttl || this.DEFAULT_TTL)
    }
  }

  get<T>(key: string): CacheEntry<T> | null {
    return this.cache.get(key) || null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Очистка устаревших записей
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.isStale || (now - entry.timestamp) > this.DEFAULT_TTL * 2) {
        this.cache.delete(key)
      }
    }
  }
}

// Глобальный экземпляр кэша
const cacheManager = new CacheManager()

// Очистка кэша каждые 10 минут
setInterval(() => {
  cacheManager.cleanup()
}, 10 * 60 * 1000)

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const {
    ttl = 5 * 60 * 1000, // 5 минут по умолчанию
    staleWhileRevalidate = true,
    maxAge = 30 * 60 * 1000 // 30 минут максимум
  } = options

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      // Проверяем кэш
      const cached = cacheManager.get<T>(key)
      
      if (cached && !forceRefresh) {
        const age = Date.now() - cached.timestamp
        
        // Если данные свежие, возвращаем их
        if (age < ttl && !cached.isStale) {
          setData(cached.data)
          setError(null)
          return cached.data
        }
        
        // Если включен staleWhileRevalidate, показываем старые данные
        if (staleWhileRevalidate && age < maxAge) {
          setData(cached.data)
          setError(null)
        }
      }

      setLoading(true)
      const result = await fetcher()
      
      // Сохраняем в кэш
      cacheManager.set(key, result, ttl)
      
      setData(result)
      setError(null)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      
      // Если есть кэшированные данные, используем их при ошибке
      const cached = cacheManager.get<T>(key)
      if (cached && Date.now() - cached.timestamp < maxAge) {
        setData(cached.data)
      }
      
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl, staleWhileRevalidate, maxAge])

  // Загружаем данные при монтировании
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const mutate = useCallback((newData?: T) => {
    if (newData !== undefined) {
      cacheManager.set(key, newData, ttl)
      setData(newData)
    } else {
      // Перезагружаем данные
      fetchData(true)
    }
  }, [key, ttl, fetchData])

  const invalidate = useCallback(() => {
    cacheManager.delete(key)
    fetchData(true)
  }, [key, fetchData])

  return {
    data,
    loading,
    error,
    mutate,
    invalidate,
    refetch: () => fetchData(true)
  }
}

// Хук для кэширования с localStorage
export function usePersistentCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(() => {
    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        const age = Date.now() - parsed.timestamp
        if (age < (options.maxAge || 30 * 60 * 1000)) {
          return parsed.data
        }
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
    return null
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh && data) {
        return data
      }

      setLoading(true)
      const result = await fetcher()
      
      // Сохраняем в localStorage
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }))
      } catch {
        // Игнорируем ошибки записи в localStorage
      }
      
      setData(result)
      setError(null)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, data])

  useEffect(() => {
    if (!data) {
      fetchData()
    }
  }, [fetchData, data])

  const mutate = useCallback((newData: T) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data: newData,
        timestamp: Date.now()
      }))
    } catch {
      // Игнорируем ошибки записи
    }
    setData(newData)
  }, [key])

  const invalidate = useCallback(() => {
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch {
      // Игнорируем ошибки
    }
    setData(null)
    fetchData(true)
  }, [key, fetchData])

  return {
    data,
    loading,
    error,
    mutate,
    invalidate,
    refetch: () => fetchData(true)
  }
}

export { cacheManager }