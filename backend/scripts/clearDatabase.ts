/**
 * Скрипт для полной очистки базы данных
 * Удаляет все данные кроме пользователя разработчика
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('🚨 НАЧИНАЕТСЯ ОЧИСТКА БАЗЫ ДАННЫХ...')
    
    // Проверяем какие таблицы есть
    console.log('📊 Проверка текущих данных...')
    
    const userCount = await prisma.user.count()
    console.log(`👥 Пользователей в базе: ${userCount}`)
    
    // Очищаем все таблицы в правильном порядке (с учетом внешних ключей)
    console.log('🗑️ Удаление всех данных...')
    
    // Удаляем все записи из всех таблиц
    await prisma.user.deleteMany({
      where: {
        role: {
          not: 'developer' // Сохраняем только разработчика
        }
      }
    })
    
    console.log('✅ Пользователи очищены (кроме разработчика)')
    
    // Если есть другие таблицы, очищаем их тоже
    // (добавьте сюда очистку других таблиц по мере необходимости)
    
    // Проверяем результат
    const finalUserCount = await prisma.user.count()
    console.log(`✅ Очистка завершена!`)
    console.log(`👥 Осталось пользователей: ${finalUserCount}`)
    
    // Показываем оставшихся пользователей
    const remainingUsers = await prisma.user.findMany()
    console.log('👤 Оставшиеся пользователи:')
    remainingUsers.forEach(user => {
      console.log(`  - ${user.login} (${user.role})`)
    })
    
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем очистку
clearDatabase()

