/**
 * Скрипт для полной очистки базы данных
 * Удаляет все данные кроме пользователя-разработчика
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️ НАЧИНАЕТСЯ ОЧИСТКА БАЗЫ ДАННЫХ...');

  try {
    // Получаем информацию о разработчике перед удалением
    const developer = await prisma.user.findUnique({
      where: { login: 'developer' }
    });

    if (!developer) {
      console.log('❌ Пользователь-разработчик не найден!');
      return;
    }

    console.log(`👤 Найден разработчик: ${developer.login} (${developer.role})`);

    // Удаляем все данные (таблицы будут очищены автоматически из-за CASCADE)
    console.log('🗑️ Удаление всех пользователей...');
    await prisma.user.deleteMany({});

    // Создаем заново только разработчика
    console.log('👤 Восстановление разработчика...');
    await prisma.user.create({
      data: {
        id: developer.id,
        login: developer.login,
        password: developer.password,
        role: developer.role,
      },
    });

    console.log('✅ БАЗА ДАННЫХ ПОЛНОСТЬЮ ОЧИЩЕНА!');
    console.log('👤 Остался только пользователь-разработчик');
    console.log('🔑 Логин: developer');
    console.log('🔑 Пароль: developer123');

  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем очистку
clearDatabase();

