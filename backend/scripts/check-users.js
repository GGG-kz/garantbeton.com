const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkUsers() {
  try {
    console.log('🔍 Проверка пользователей в базе данных...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Найдено пользователей: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.login} (${user.role}) - ${user.createdAt}`);
    });
    
    if (users.length === 0) {
      console.log('⚠️  Пользователей нет! Нужно создать тестового пользователя.');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
