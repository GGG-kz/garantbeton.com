import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkTables() {
  try {
    console.log('🔍 Проверка таблиц в базе данных...');
    
    // Проверяем таблицы через Prisma
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Найденные таблицы:');
    (tables as any[]).forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Проверяем структуру таблицы users
    if ((tables as any[]).some((t: any) => t.table_name === 'users')) {
      console.log('\n🔍 Структура таблицы users:');
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `;
      
      (columns as any[]).forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Пробуем создать тестового пользователя
    console.log('\n🧪 Тест создания пользователя...');
    try {
      const testUser = await prisma.user.create({
        data: {
          login: 'test_user',
          password_hash: 'test_password',
          role: 'USER',
          updatedAt: new Date()
        }
      });
      console.log('✅ Пользователь создан успешно:', testUser.id);
      
      // Удаляем тестового пользователя
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('✅ Тестовый пользователь удален');
      
    } catch (error) {
      console.log('❌ Ошибка при создании пользователя:', error);
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
