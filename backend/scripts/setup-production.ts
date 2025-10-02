import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function setupProduction() {
  try {
    console.log('🚀 Настройка продакшена...');
    console.log('📍 База данных:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'));
    
    // 1. Проверка подключения
    console.log('\n1️⃣ Проверка подключения...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Подключение успешно!');
    
    // 2. Применение миграций
    console.log('\n2️⃣ Применение миграций...');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
      });
      console.log('✅ Миграции применены!');
    } catch (error) {
      console.log('⚠️  Ошибка при применении миграций:', error);
    }
    
    // 3. Генерация Prisma клиента
    console.log('\n3️⃣ Генерация Prisma клиента...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma клиент сгенерирован!');
    } catch (error) {
      console.log('⚠️  Ошибка при генерации клиента:', error);
    }
    
    // 4. Проверка таблиц
    console.log('\n4️⃣ Проверка таблиц...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Таблицы в базе данных:');
    (tables as any[]).forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 5. Заполнение тестовыми данными (опционально)
    console.log('\n5️⃣ Заполнение тестовыми данными...');
    try {
      execSync('npx ts-node prisma/seed.ts', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
      });
      console.log('✅ Тестовые данные добавлены!');
    } catch (error) {
      console.log('⚠️  Ошибка при заполнении данными:', error);
    }
    
    console.log('\n🎉 Настройка продакшена завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка настройки продакшена:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupProduction();
