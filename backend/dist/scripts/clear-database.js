"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function clearDatabase() {
    console.log('🗑️ НАЧИНАЕТСЯ ОЧИСТКА БАЗЫ ДАННЫХ...');
    try {
        const developer = await prisma.user.findUnique({
            where: { login: 'developer' }
        });
        if (!developer) {
            console.log('❌ Пользователь-разработчик не найден!');
            return;
        }
        console.log(`👤 Найден разработчик: ${developer.login} (${developer.role})`);
        console.log('🗑️ Удаление всех пользователей...');
        await prisma.user.deleteMany({});
        console.log('👤 Восстановление разработчика...');
        await prisma.user.create({
            data: {
                id: developer.id,
                login: developer.login,
                password_hash: developer.password_hash,
                role: developer.role,
                updatedAt: new Date(),
            },
        });
        console.log('✅ БАЗА ДАННЫХ ПОЛНОСТЬЮ ОЧИЩЕНА!');
        console.log('👤 Остался только пользователь-разработчик');
        console.log('🔑 Логин: developer');
        console.log('🔑 Пароль: developer123');
    }
    catch (error) {
        console.error('❌ Ошибка при очистке базы данных:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
clearDatabase();
//# sourceMappingURL=clear-database.js.map