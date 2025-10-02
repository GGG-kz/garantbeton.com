/**
 * Утилиты для принудительного обновления данных и предотвращения кэширования
 */

// Версия данных для отслеживания изменений
const DATA_VERSION_KEY = 'beton_app_data_version'
const CURRENT_VERSION = Date.now().toString()

/**
 * Принудительно обновляет версию данных
 */
export const forceDataRefresh = () => {
  localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION)
  console.log('🔄 Принудительное обновление данных:', CURRENT_VERSION)
}

/**
 * Проверяет, нужно ли обновить данные
 */
export const shouldRefreshData = (): boolean => {
  const storedVersion = localStorage.getItem(DATA_VERSION_KEY)
  return storedVersion !== CURRENT_VERSION
}

/**
 * Полностью очищает кэш браузера для приложения
 */
export const clearBrowserCache = () => {
  // Очищаем все данные localStorage
  const keysToRemove = Object.keys(localStorage)
  keysToRemove.forEach(key => {
    if (key.startsWith('beton_') || key.includes('counterparties') || key.includes('concreteGrades')) {
      localStorage.removeItem(key)
    }
  })
  
  // Устанавливаем новую версию
  forceDataRefresh()
  
  console.log('🗑️ Кэш браузера очищен, версия обновлена')
}

/**
 * Принудительная перезагрузка страницы с очисткой кэша
 */
export const hardRefresh = () => {
  clearBrowserCache()
  window.location.reload()
}

/**
 * Проверяет актуальность данных и обновляет при необходимости
 */
export const ensureDataFreshness = () => {
  if (shouldRefreshData()) {
    console.log('⚠️ Обнаружены устаревшие данные, обновление...')
    forceDataRefresh()
    return true
  }
  return false
}

