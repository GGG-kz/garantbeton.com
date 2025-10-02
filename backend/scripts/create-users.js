const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🔐 Создаем пользователей...');

    // Создаем админа
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 12);
    
    const admin = await prisma.user.upsert({
      where: { login: 'admin' },
      update: {
        password_hash: adminHash,
        role: 'ADMIN',
        updatedAt: new Date()
      },
      create: {
        login: 'admin',
        password_hash: adminHash,
        role: 'ADMIN',
        updatedAt: new Date()
      }
    });

    console.log('✅ Админ создан:', {
      id: admin.id,
      login: admin.login,
      role: admin.role,
      password: adminPassword
    });

    // Создаем разработчика
    const developerPassword = 'developer123';
    const developerHash = await bcrypt.hash(developerPassword, 12);
    
    const developer = await prisma.user.upsert({
      where: { login: 'developer' },
      update: {
        password_hash: developerHash,
        role: 'DEVELOPER',
        updatedAt: new Date()
      },
      create: {
        login: 'developer',
        password_hash: developerHash,
        role: 'DEVELOPER',
        updatedAt: new Date()
      }
    });

    console.log('✅ Разработчик создан:', {
      id: developer.id,
      login: developer.login,
      role: developer.role,
      password: developerPassword
    });

    // Создаем обычного пользователя
    const userPassword = 'user123';
    const userHash = await bcrypt.hash(userPassword, 12);
    
    const user = await prisma.user.upsert({
      where: { login: 'user' },
      update: {
        password_hash: userHash,
        role: 'USER',
        updatedAt: new Date()
      },
      create: {
        login: 'user',
        password_hash: userHash,
        role: 'USER',
        updatedAt: new Date()
      }
    });

    console.log('✅ Пользователь создан:', {
      id: user.id,
      login: user.login,
      role: user.role,
      password: userPassword
    });

    // Создаем водителя
    const driverPassword = 'driver123';
    const driverHash = await bcrypt.hash(driverPassword, 12);
    
    const driver = await prisma.user.upsert({
      where: { login: 'driver' },
      update: {
        password_hash: driverHash,
        role: 'DRIVER',
        updatedAt: new Date()
      },
      create: {
        login: 'driver',
        password_hash: driverHash,
        role: 'DRIVER',
        updatedAt: new Date()
      }
    });

    console.log('✅ Водитель создан:', {
      id: driver.id,
      login: driver.login,
      role: driver.role,
      password: driverPassword
    });

    console.log('\n🎉 Все пользователи созданы успешно!');
    console.log('\n📋 Данные для входа:');
    console.log('👑 Админ: admin / admin123');
    console.log('👨‍💻 Разработчик: developer / developer123');
    console.log('👤 Пользователь: user / user123');
    console.log('🚛 Водитель: driver / driver123');

  } catch (error) {
    console.error('❌ Ошибка при создании пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();
