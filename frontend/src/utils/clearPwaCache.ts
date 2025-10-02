/**
 * Очистка PWA кэша и Service Worker
 * Удаляет все кэшированные данные
 */

export const clearPwaCache = async () => {
  console.log('🧹 ОЧИСТКА PWA КЭША...')
  
  try {
    // Очищаем localStorage
    console.log('🗑️ Очистка localStorage...')
    localStorage.clear()
    
    // Очищаем sessionStorage
    console.log('🗑️ Очистка sessionStorage...')
    sessionStorage.clear()
    
    // Очищаем IndexedDB (если есть)
    console.log('🗑️ Очистка IndexedDB...')
    if ('indexedDB' in window) {
      try {
        // Получаем все базы данных
        const databases = await indexedDB.databases()
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
            console.log(`🗑️ Удалена база данных: ${db.name}`)
          }
        }
      } catch (error) {
        console.log('ℹ️ IndexedDB недоступна или пуста')
      }
    }
    
    // Очищаем кэши
    console.log('🗑️ Очистка кэшей...')
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      console.log(`📊 Найдено кэшей: ${cacheNames.length}`)
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName)
        console.log(`🗑️ Удален кэш: ${cacheName}`)
      }
    }
    
    // Отключаем Service Worker
    console.log('🗑️ Отключение Service Worker...')
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      console.log(`📊 Найдено Service Workers: ${registrations.length}`)
      
      for (const registration of registrations) {
        await registration.unregister()
        console.log(`🗑️ Отключен Service Worker: ${registration.scope}`)
      }
    }
    
    console.log('✅ PWA КЭШ ПОЛНОСТЬЮ ОЧИЩЕН!')
    
    // Принудительно обновляем страницу
    console.log('🔄 Принудительное обновление страницы...')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
    
  } catch (error) {
    console.error('❌ Ошибка при очистке PWA кэша:', error)
  }
}

export const checkPwaCache = async () => {
  console.log('🔍 ПРОВЕРКА PWA КЭША...')
  
  try {
    // Проверяем localStorage
    const localStorageKeys = Object.keys(localStorage)
    console.log(`📊 localStorage ключей: ${localStorageKeys.length}`)
    localStorageKeys.forEach(key => console.log(`  - ${key}`))
    
    // Проверяем sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage)
    console.log(`📊 sessionStorage ключей: ${sessionStorageKeys.length}`)
    sessionStorageKeys.forEach(key => console.log(`  - ${key}`))
    
    // Проверяем IndexedDB
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases()
        console.log(`📊 IndexedDB баз данных: ${databases.length}`)
        databases.forEach(db => console.log(`  - ${db.name}`))
      } catch (error) {
        console.log('ℹ️ IndexedDB недоступна')
      }
    }
    
    // Проверяем кэши
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      console.log(`📊 Кэшей: ${cacheNames.length}`)
      cacheNames.forEach(name => console.log(`  - ${name}`))
    }
    
    // Проверяем Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      console.log(`📊 Service Workers: ${registrations.length}`)
      registrations.forEach(reg => console.log(`  - ${reg.scope}`))
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке PWA кэша:', error)
  }
}

export const forceClearAll = async () => {
  console.log('💥 ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ВСЕГО...')
  
  await clearPwaCache()
  
  // Дополнительно очищаем cookies
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
  })
  
  console.log('✅ ВСЕ ДАННЫЕ УДАЛЕНЫ!')
}

