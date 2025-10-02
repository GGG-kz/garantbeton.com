"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function clearDatabase() {
    try {
        console.log('🚨 НАЧИНАЕТСЯ ОЧИСТКА БАЗЫ ДАННЫХ...');
        console.log('📊 Проверка текущих данных...');
        const userCount = await prisma.user.count();
        console.log(`👥 Пользователей в базе: ${userCount}`);
        console.log('🗑️ Удаление всех данных...');
        await prisma.user.deleteMany({
            where: {
                role: {
                    not: 'developer'
                }
            }
        });
        console.log('✅ Пользователи очищены (кроме разработчика)');
        const finalUserCount = await prisma.user.count();
        console.log(`✅ Очистка завершена!`);
        console.log(`👥 Осталось пользователей: ${finalUserCount}`);
        const remainingUsers = await prisma.user.findMany();
        console.log('👤 Оставшиеся пользователи:');
        remainingUsers.forEach(user => {
            console.log(`  - ${user.login} (${user.role})`);
        });
    }
    catch (error) {
        console.error('❌ Ошибка при очистке базы данных:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
clearDatabase();
//# sourceMappingURL=clearDatabase.js.map