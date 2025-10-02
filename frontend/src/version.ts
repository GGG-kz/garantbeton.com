// Версия приложения для принудительного обновления кэша
export const APP_VERSION = '1.0.1'

// Функция для проверки обновления
export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        console.log('Service Worker обновлен')
      }
    } catch (error) {
      console.error('Ошибка при обновлении Service Worker:', error)
    }
  }
}

// Функция для принудительного обновления кэша
export const forceUpdateCache = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Очищаем все кэши
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        console.log('Все кэши очищены')
      }
      
      // Перерегистрируем Service Worker
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
        window.location.reload()
      }
    } catch (error) {
      console.error('Ошибка при принудительном обновлении:', error)
    }
  }
}

