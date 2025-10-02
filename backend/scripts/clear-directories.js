const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDirectories() {
  try {
    console.log('🧹 Очищаем справочники...');

    // Удаляем в правильном порядке (сначала зависимые таблицы)
    await prisma.driver.deleteMany();
    console.log('✅ Водители очищены');

    await prisma.transport.deleteMany();
    console.log('✅ Транспорт очищен');

    await prisma.material.deleteMany();
    console.log('✅ Материалы очищены');

    await prisma.warehouse.deleteMany();
    console.log('✅ Склады очищены');

    await prisma.concreteGrade.deleteMany();
    console.log('✅ Марки бетона очищены');

    await prisma.counterparty.deleteMany();
    console.log('✅ Контрагенты очищены');

    console.log('🎉 Все справочники очищены!');

  } catch (error) {
    console.error('❌ Ошибка при очистке справочников:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDirectories();

