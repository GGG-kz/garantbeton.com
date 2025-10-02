/**
 * Консольные команды для очистки данных
 * Доступны через window.clearAll в консоли браузера
 */

import { nuclearClear, checkAllData } from './nuclearClear'
import { clearPwaCache, checkPwaCache } from './clearPwaCache'

// Добавляем функции в глобальный объект window для доступа из консоли
declare global {
  interface Window {
    clearAll: () => void
    clearPwa: () => Promise<void>
    checkData: () => void
    checkCache: () => Promise<void>
    clearSpecific: () => void
  }
}

export const setupConsoleCommands = () => {
  // Ядерная очистка всех данных
  window.clearAll = () => {
    console.log('💥 ЗАПУСК ЯДЕРНОЙ ОЧИСТКИ ИЗ КОНСОЛИ...')
    const removed = nuclearClear()
    console.log(`✅ Удалено ${removed} ключей`)
    setTimeout(() => window.location.reload(), 1000)
  }

  // Очистка PWA кэша
  window.clearPwa = async () => {
    console.log('🧹 ОЧИСТКА PWA КЭША ИЗ КОНСОЛИ...')
    await clearPwaCache()
  }

  // Проверка данных
  window.checkData = () => {
    console.log('🔍 ПРОВЕРКА ДАННЫХ ИЗ КОНСОЛИ...')
    const count = checkAllData()
    console.log(`📊 ВСЕГО записей: ${count}`)
  }

  // Проверка кэша
  window.checkCache = async () => {
    console.log('🔍 ПРОВЕРКА КЭША ИЗ КОНСОЛИ...')
    await checkPwaCache()
  }

  // Очистка конкретных данных
  window.clearSpecific = () => {
    console.log('🗑️ ОЧИСТКА КОНКРЕТНЫХ ДАННЫХ ИЗ КОНСОЛИ...')
    import('./clearSpecificData').then(({ clearSpecificData }) => {
      const removed = clearSpecificData()
      console.log(`✅ Удалено ${removed} ключей`)
      setTimeout(() => window.location.reload(), 1000)
    })
  }

  console.log('🛠️ КОНСОЛЬНЫЕ КОМАНДЫ ДОСТУПНЫ:')
  console.log('   clearAll() - ядерная очистка всех данных')
  console.log('   clearPwa() - очистка PWA кэша')
  console.log('   checkData() - проверить все данные')
  console.log('   checkCache() - проверить PWA кэш')
  console.log('   clearSpecific() - очистить данные из изображений')
}

// Автоматически настраиваем команды при загрузке
if (typeof window !== 'undefined') {
  setupConsoleCommands()
}
