// Утилиты для очистки данных localStorage

export const clearAllDirectoryData = () => {
  const keys = [
    'counterparties',
    'concreteGrades', 
    'warehouses',
    'materials',
    'drivers',
    'vehicles',
    'prices'
  ]
  
  keys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log('✅ Все данные справочников очищены из localStorage')
}

export const clearEntireSystem = () => {
  // Очищаем все данные системы
  const keys = [
    'counterparties',
    'concreteGrades',
    'warehouses', 
    'materials',
    'drivers',
    'vehicles',
    'prices',
    'orders',
    'requests',
    'invoices',
    'receipts',
    'messages',
    'user',
    'auth'
  ]
  
  keys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log('🚨 ВСЕ данные системы очищены!')
}

export const checkLocalStorageData = () => {
  const keys = [
    'counterparties',
    'concreteGrades',
    'warehouses',
    'materials', 
    'drivers',
    'vehicles',
    'prices'
  ]
  
  const data: Record<string, any> = {}
  
  keys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      try {
        data[key] = JSON.parse(value)
      } catch (e) {
        data[key] = value
      }
    }
  })
  
  console.log('📊 Данные в localStorage:', data)
  return data
}
