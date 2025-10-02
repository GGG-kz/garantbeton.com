import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

console.log('🚀 Optimized API Client initialized:', API_BASE_URL)

// Кэш для GET запросов
const requestCache = new Map<string, {
  data: any
  timestamp: number
  ttl: number
}>()

// Очистка кэша каждые 5 минут
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      requestCache.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Функция для создания ключа кэша
function getCacheKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
}

// Создаем оптимизированный клиент
export const optimizedApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Увеличиваем timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
  },
})

// Request interceptor с кэшированием
optimizedApiClient.interceptors.request.use(
  (config) => {
    // Добавляем токен
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.accessToken) {
          config.headers.Authorization = `Bearer ${authData.state.accessToken}`
        }
      } catch (error) {
        console.error('Ошибка при парсинге токена:', error)
      }
    }

    // Оптимизация заголовков
    config.headers['Cache-Control'] = 'no-cache'
    
    // Для GET запросов проверяем кэш
    if (config.method === 'get' && !config.headers['X-No-Cache']) {
      const cacheKey = getCacheKey(config)
      const cached = requestCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        // Возвращаем кэшированные данные
        return Promise.reject({
          __cached: true,
          data: cached.data,
          config
        })
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor с кэшированием и обработкой ошибок
optimizedApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Кэшируем GET запросы
    if (response.config.method === 'get' && !response.config.headers['X-No-Cache']) {
      const cacheKey = getCacheKey(response.config)
      const ttl = response.headers['cache-control']?.includes('max-age') 
        ? parseInt(response.headers['cache-control'].match(/max-age=(\d+)/)?.[1] || '300') * 1000
        : 5 * 60 * 1000 // 5 минут по умолчанию

      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
        ttl
      })
    }

    return response
  },
  async (error) => {
    // Обработка кэшированных данных
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK (cached)',
        headers: {},
        config: error.config
      })
    }

    const originalRequest = error.config

    // Обработка 401 ошибок с refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const token = localStorage.getItem('auth-storage')
        if (token) {
          const authData = JSON.parse(token)
          if (authData.state?.refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: authData.state.refreshToken,
            })

            const newAccessToken = response.data.accessToken
            authData.state.accessToken = newAccessToken
            localStorage.setItem('auth-storage', JSON.stringify(authData))

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return optimizedApiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Оптимизированные методы API
export const optimizedApi = {
  // GET с кэшированием
  get: <T = any>(url: string, config?: AxiosRequestConfig & { ttl?: number }) => {
    return optimizedApiClient.get<T>(url, config)
  },

  // GET без кэширования (всегда свежие данные)
  getFresh: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return optimizedApiClient.get<T>(url, {
      ...config,
      headers: {
        ...config?.headers,
        'X-No-Cache': 'true'
      }
    })
  },

  // POST с автоматической инвалидацией кэша
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    // Очищаем связанный кэш
    const baseUrl = url.split('/')[0]
    for (const key of requestCache.keys()) {
      if (key.includes(baseUrl)) {
        requestCache.delete(key)
      }
    }
    
    return optimizedApiClient.post<T>(url, data, config)
  },

  // PUT с автоматической инвалидацией кэша
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const baseUrl = url.split('/')[0]
    for (const key of requestCache.keys()) {
      if (key.includes(baseUrl)) {
        requestCache.delete(key)
      }
    }
    
    return optimizedApiClient.put<T>(url, data, config)
  },

  // DELETE с автоматической инвалидацией кэша
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    const baseUrl = url.split('/')[0]
    for (const key of requestCache.keys()) {
      if (key.includes(baseUrl)) {
        requestCache.delete(key)
      }
    }
    
    return optimizedApiClient.delete<T>(url, config)
  },

  // Очистка всего кэша
  clearCache: () => {
    requestCache.clear()
  },

  // Очистка кэша по паттерну
  clearCachePattern: (pattern: string) => {
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key)
      }
    }
  },

  // Предзагрузка данных
  prefetch: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return optimizedApiClient.get<T>(url, config).catch(() => {
      // Игнорируем ошибки предзагрузки
    })
  }
}

// Batch запросы для оптимизации
export const batchApi = {
  // Выполнение нескольких запросов параллельно
  parallel: <T = any>(requests: Promise<AxiosResponse<T>>[]) => {
    return Promise.allSettled(requests)
  },

  // Выполнение запросов с ограничением concurrency
  concurrent: async <T = any>(
    requests: (() => Promise<AxiosResponse<T>>)[],
    limit = 3
  ) => {
    const results: AxiosResponse<T>[] = []
    
    for (let i = 0; i < requests.length; i += limit) {
      const batch = requests.slice(i, i + limit)
      const batchResults = await Promise.allSettled(
        batch.map(request => request())
      )
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        }
      })
    }
    
    return results
  },

  // Batch операции для создания/обновления
  batchMutate: async <T = any>(
    operations: Array<{
      method: 'post' | 'put' | 'delete'
      url: string
      data?: any
    }>
  ) => {
    const requests = operations.map(op => {
      switch (op.method) {
        case 'post':
          return () => optimizedApi.post<T>(op.url, op.data)
        case 'put':
          return () => optimizedApi.put<T>(op.url, op.data)
        case 'delete':
          return () => optimizedApi.delete<T>(op.url)
        default:
          throw new Error(`Unsupported method: ${op.method}`)
      }
    })

    return batchApi.concurrent(requests, 2) // Ограничиваем до 2 одновременных мутаций
  }
}

// Утилиты для мониторинга производительности
export const performanceUtils = {
  // Измерение времени выполнения запроса
  measureRequest: async <T = any>(
    requestFn: () => Promise<AxiosResponse<T>>,
    label?: string
  ) => {
    const start = performance.now()
    try {
      const result = await requestFn()
      const duration = performance.now() - start
      console.log(`🚀 ${label || 'Request'} completed in ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      const duration = performance.now() - start
      console.error(`❌ ${label || 'Request'} failed after ${duration.toFixed(2)}ms`, error)
      throw error
    }
  },

  // Статистика кэша
  getCacheStats: () => {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0
    
    for (const [, entry] of requestCache.entries()) {
      if (now - entry.timestamp < entry.ttl) {
        validEntries++
      } else {
        expiredEntries++
      }
    }

    return {
      totalEntries: requestCache.size,
      validEntries,
      expiredEntries,
      hitRatio: validEntries / (validEntries + expiredEntries) || 0
    }
  }
}

// Экспортируем оригинальный клиент для обратной совместимости
export { optimizedApiClient as apiClient }