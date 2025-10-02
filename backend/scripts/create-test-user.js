const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createTestUser() {
  try {
    console.log('👤 Создание тестового пользователя...');
    
    const password = 'developer123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        login: 'developer',
        password_hash: passwordHash,
        role: 'developer',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Пользователь создан успешно!');
    console.log(`👤 Логин: ${user.login}`);
    console.log(`🔑 Пароль: ${password}`);
    console.log(`🎭 Роль: ${user.role}`);
    console.log(`🆔 ID: ${user.id}`);
    
  } catch (error) {
    console.error('❌ Ошибка создания пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
