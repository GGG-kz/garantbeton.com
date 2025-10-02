/**
 * Утилита для очистки конкретных данных из localStorage
 * Специально для удаления данных из изображений пользователя
 */

export const clearSpecificData = () => {
  console.log('🚨 ОЧИСТКА КОНКРЕТНЫХ ДАННЫХ...')
  
  // Точные ключи из кода приложения
  const specificKeys = [
    'prices',              // Управление ценами (изображение 1)
    'additionalServices',  // Цены дополнительных услуг (изображение 2) 
    'internalRequests',    // Внутренние заявки (изображение 3)
    'servicePrices'        // Альтернативный ключ для дополнительных услуг
  ]
  
  let removedCount = 0
  
  specificKeys.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        const count = parsed.length || 0
        console.log(`📊 Найдено в ${key}: ${count} записей`)
        
        localStorage.removeItem(key)
        console.log(`🗑️ Удален ключ: ${key}`)
        removedCount++
      } catch (error) {
        console.log(`❌ Ошибка при обработке ${key}:`, error)
      }
    } else {
      console.log(`ℹ️ Ключ ${key}: нет данных`)
    }
  })
  
  console.log(`✅ ОЧИСТКА ЗАВЕРШЕНА!`)
  console.log(`📊 Удалено ${removedCount} ключей`)
  
  // Показываем что осталось
  console.log('\n📋 Оставшиеся ключи в localStorage:')
  Object.keys(localStorage).forEach(key => {
    console.log(`  - ${key}`)
  })
  
  return removedCount
}

export const checkSpecificData = () => {
  console.log('🔍 ПРОВЕРКА КОНКРЕТНЫХ ДАННЫХ...')
  
  const keysToCheck = [
    'prices',
    'additionalServices', 
    'internalRequests',
    'servicePrices'
  ]
  
  let totalRecords = 0
  
  keysToCheck.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        const count = parsed.length || 0
        console.log(`📊 ${key}: ${count} записей`)
        
        // Показываем первые несколько записей для примера
        if (count > 0 && parsed.length > 0) {
          console.log(`   Пример: ${JSON.stringify(parsed[0], null, 2).substring(0, 100)}...`)
        }
        
        totalRecords += count
      } catch (error) {
        console.log(`❌ ${key}: некорректные данные`)
      }
    } else {
      console.log(`ℹ️ ${key}: нет данных`)
    }
  })
  
  console.log(`🎯 ВСЕГО записей в этих ключах: ${totalRecords}`)
  return totalRecords
}

export const forceClearSpecificData = () => {
  console.log('💥 ПРИНУДИТЕЛЬНАЯ ОЧИСТКА...')
  
  // Удаляем даже если данные повреждены
  const specificKeys = [
    'prices',
    'additionalServices', 
    'internalRequests',
    'servicePrices'
  ]
  
  specificKeys.forEach(key => {
    try {
      localStorage.removeItem(key)
      console.log(`🗑️ Принудительно удален: ${key}`)
    } catch (error) {
      console.log(`❌ Ошибка при удалении ${key}:`, error)
    }
  })
  
  // Принудительно обновляем страницу
  console.log('🔄 Обновление страницы...')
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

