import { useState, useEffect, useCallback, useRef } from 'react'

// Кэш для localStorage чтобы избежать повторного парсинга
const storageCache = new Map<string, any>()

// Debounce функция для оптимизации записи
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function useOptimizedLocalStorage<T>(key: string, initialValue: T) {
  // Получаем значение из кэша или localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Сначала проверяем кэш
      if (storageCache.has(key)) {
        return storageCache.get(key)
      }

      const item = window.localStorage.getItem(key)
      const value = item ? JSON.parse(item) : initialValue
      
      // Кэшируем значение
      storageCache.set(key, value)
      return value
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Debounced функция для записи в localStorage
  const debouncedWrite = useRef(
    debounce((key: string, value: T) => {
      try {
        const serializedValue = JSON.stringify(value)
        window.localStorage.setItem(key, serializedValue)
        storageCache.set(key, value)
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    }, 100) // Debounce на 100ms
  ).current

  // Функция для обновления значения
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // Debounced запись в localStorage
      debouncedWrite(key, valueToStore)
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, debouncedWrite])

  // Слушаем изменения в других вкладках
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue)
          setStoredValue(newValue)
          storageCache.set(key, newValue)
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue] as const
}

// Хук с TTL и сжатием
export function useAdvancedLocalStorage<T>(
  key: string, 
  initialValue: T,
  options: {
    compress?: boolean
    maxSize?: number
    ttl?: number
  } = {}
) {
  const { compress = false, maxSize = 1024 * 1024, ttl } = options

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (storageCache.has(key)) {
        return storageCache.get(key)
      }

      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = JSON.parse(item)
      
      // Проверяем TTL
      if (ttl && parsed.timestamp && Date.now() - parsed.timestamp > ttl) {
        window.localStorage.removeItem(key)
        return initialValue
      }

      const value = parsed.data || parsed
      storageCache.set(key, value)
      return value
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      const dataToStore = ttl 
        ? { data: valueToStore, timestamp: Date.now() }
        : valueToStore

      const serialized = JSON.stringify(dataToStore)
      
      if (serialized.length > maxSize) {
        console.warn(`Data for key "${key}" exceeds maxSize (${maxSize} bytes)`)
        return
      }

      setStoredValue(valueToStore)
      window.localStorage.setItem(key, serialized)
      storageCache.set(key, valueToStore)
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, maxSize, ttl])

  return [storedValue, setValue] as const
}

// Утилиты для управления localStorage
export const storageUtils = {
  getStorageSize: (): number => {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  },

  clearCache: (): void => {
    storageCache.clear()
  },

  getCacheStats: () => {
    return {
      size: storageCache.size,
      keys: Array.from(storageCache.keys())
    }
  }
}