/**
 * ЯДЕРНАЯ ОЧИСТКА - удаляет ВСЕ данные из системы
 * Используется когда обычная очистка не помогает
 */

export const nuclearClear = () => {
  console.log('💥 ЗАПУСК ЯДЕРНОЙ ОЧИСТКИ...')
  
  // Получаем все ключи localStorage
  const allKeys = Object.keys(localStorage)
  console.log(`📊 Найдено ${allKeys.length} ключей в localStorage:`)
  allKeys.forEach(key => console.log(`  - ${key}`))
  
  // Очищаем ВСЕ данные кроме авторизации и версии
  const keysToKeep = ['auth-storage', 'beton_app_data_version']
  let removedCount = 0
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      try {
        localStorage.removeItem(key)
        console.log(`🗑️ Удален: ${key}`)
        removedCount++
      } catch (error) {
        console.log(`❌ Ошибка при удалении ${key}:`, error)
      }
    }
  })
  
  console.log(`✅ ЯДЕРНАЯ ОЧИСТКА ЗАВЕРШЕНА!`)
  console.log(`📊 Удалено ${removedCount} ключей`)
  console.log(`🔄 Остались только: ${keysToKeep.join(', ')}`)
  
  // Проверяем что осталось
  const remainingKeys = Object.keys(localStorage)
  console.log(`🎯 Осталось ключей: ${remainingKeys.length}`)
  remainingKeys.forEach(key => console.log(`  ✓ ${key}`))
  
  return removedCount
}

export const checkAllData = () => {
  console.log('🔍 ПРОВЕРКА ВСЕХ ДАННЫХ В СИСТЕМЕ...')
  
  const allKeys = Object.keys(localStorage)
  let totalRecords = 0
  
  console.log(`📊 Всего ключей в localStorage: ${allKeys.length}`)
  
  allKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          console.log(`📋 ${key}: ${parsed.length} записей`)
          totalRecords += parsed.length
        } else if (typeof parsed === 'object') {
          const keys = Object.keys(parsed)
          console.log(`📋 ${key}: объект с ${keys.length} свойствами`)
        } else {
          console.log(`📋 ${key}: ${typeof parsed} значение`)
        }
      } else {
        console.log(`📋 ${key}: пустое значение`)
      }
    } catch (error) {
      console.log(`❌ ${key}: некорректные данные`)
    }
  })
  
  console.log(`🎯 ВСЕГО записей в системе: ${totalRecords}`)
  return totalRecords
}

export const forceRefresh = () => {
  console.log('🔄 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ...')
  
  // Очищаем кэш браузера
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name)
        console.log(`🗑️ Очищен кэш: ${name}`)
      })
    })
  }
  
  // Принудительно обновляем страницу
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

