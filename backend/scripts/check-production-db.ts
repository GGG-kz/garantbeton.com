import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkDatabase() {
  try {
    console.log('🔍 Проверка подключения к базе данных...');
    console.log('📍 URL:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'));
    
    // Простая проверка подключения
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Подключение к базе данных успешно!');
    
    // Проверка таблиц
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📊 Найденные таблицы:', tables);
    
    if (Array.isArray(tables) && tables.length === 0) {
      console.log('⚠️  База данных пустая. Нужно применить миграции.');
    } else {
      console.log('✅ Таблицы найдены в базе данных.');
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
