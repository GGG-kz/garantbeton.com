import { useState, useEffect } from 'react'
import { ensureDataFreshness } from '../utils/forceRefresh'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Инициализируем состояние из localStorage или используем начальное значение
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Проверяем актуальность данных при каждой загрузке
      ensureDataFreshness()
      
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        // Добавляем временную метку для отслеживания актуальности
        return parsed
      }
      return initialValue
    } catch (error) {
      console.error(`Ошибка при чтении localStorage ключа "${key}":`, error)
      return initialValue
    }
  })

  // Функция для обновления значения
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Позволяем value быть функцией, чтобы мы могли использовать тот же API, что и useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Ошибка при записи в localStorage ключа "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}
