// Утилиты для экспорта и импорта данных между браузерами

export interface ExportData {
  counterparties: any[]
  concreteGrades: any[]
  warehouses: any[]
  materials: any[]
  drivers: any[]
  vehicles: any[]
  orders: any[]
  expenseInvoices: any[]
  internalRequests: any[]
  prices: any[]
  additionalServices: any[]
  notifications: any[]
  exportDate: string
  version: string
}

export const exportAllData = (): string => {
  try {
    const data: ExportData = {
      counterparties: JSON.parse(localStorage.getItem('counterparties') || '[]'),
      concreteGrades: JSON.parse(localStorage.getItem('concreteGrades') || '[]'),
      warehouses: JSON.parse(localStorage.getItem('warehouses') || '[]'),
      materials: JSON.parse(localStorage.getItem('materials') || '[]'),
      drivers: JSON.parse(localStorage.getItem('drivers') || '[]'),
      vehicles: JSON.parse(localStorage.getItem('vehicles') || '[]'),
      orders: JSON.parse(localStorage.getItem('orders') || '[]'),
      expenseInvoices: JSON.parse(localStorage.getItem('expenseInvoices') || '[]'),
      internalRequests: JSON.parse(localStorage.getItem('internalRequests') || '[]'),
      prices: JSON.parse(localStorage.getItem('prices') || '[]'),
      additionalServices: JSON.parse(localStorage.getItem('additionalServices') || '[]'),
      notifications: JSON.parse(localStorage.getItem('notifications') || '[]'),
      exportDate: new Date().toISOString(),
      version: '1.0.1'
    }

    const jsonString = JSON.stringify(data, null, 2)
    
    // Создаем файл для скачивания
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beton-app-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return 'Данные успешно экспортированы'
  } catch (error) {
    console.error('Ошибка при экспорте данных:', error)
    return 'Ошибка при экспорте данных'
  }
}

export const importAllData = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string
        const data: ExportData = JSON.parse(jsonString)
        
        // Проверяем версию
        if (data.version && data.version !== '1.0.1') {
          resolve('Версия файла не совместима с текущей версией приложения')
          return
        }
        
        // Сохраняем данные в localStorage
        if (data.counterparties) localStorage.setItem('counterparties', JSON.stringify(data.counterparties))
        if (data.concreteGrades) localStorage.setItem('concreteGrades', JSON.stringify(data.concreteGrades))
        if (data.warehouses) localStorage.setItem('warehouses', JSON.stringify(data.warehouses))
        if (data.materials) localStorage.setItem('materials', JSON.stringify(data.materials))
        if (data.drivers) localStorage.setItem('drivers', JSON.stringify(data.drivers))
        if (data.vehicles) localStorage.setItem('vehicles', JSON.stringify(data.vehicles))
        if (data.orders) localStorage.setItem('orders', JSON.stringify(data.orders))
        if (data.expenseInvoices) localStorage.setItem('expenseInvoices', JSON.stringify(data.expenseInvoices))
        if (data.internalRequests) localStorage.setItem('internalRequests', JSON.stringify(data.internalRequests))
        if (data.prices) localStorage.setItem('prices', JSON.stringify(data.prices))
        if (data.additionalServices) localStorage.setItem('additionalServices', JSON.stringify(data.additionalServices))
        if (data.notifications) localStorage.setItem('notifications', JSON.stringify(data.notifications))
        
        resolve('Данные успешно импортированы')
      } catch (error) {
        console.error('Ошибка при импорте данных:', error)
        resolve('Ошибка при импорте данных: неверный формат файла')
      }
    }
    
    reader.onerror = () => {
      resolve('Ошибка при чтении файла')
    }
    
    reader.readAsText(file)
  })
}

export const clearAllData = (): string => {
  try {
    const keys = [
      'counterparties', 'concreteGrades', 'warehouses', 'materials', 
      'drivers', 'vehicles', 'orders', 'expenseInvoices', 
      'internalRequests', 'prices', 'additionalServices', 'notifications'
    ]
    
    keys.forEach(key => localStorage.removeItem(key))
    
    return 'Все данные очищены'
  } catch (error) {
    console.error('Ошибка при очистке данных:', error)
    return 'Ошибка при очистке данных'
  }
}

