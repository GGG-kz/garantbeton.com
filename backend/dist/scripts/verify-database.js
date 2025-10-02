"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function verifyDatabase() {
    console.log('🔍 Проверка целостности базы данных...');
    try {
        await prisma.$connect();
        console.log('✅ Подключение к базе данных установлено');
        const tables = [
            'users',
            'drivers',
            'counterparties',
            'concrete_grades',
            'warehouses',
            'materials',
            'vehicles',
            'orders',
            'expense_invoices',
            'receipt_invoices',
            'weighings',
            'prices',
            'internal_requests',
            'messages',
            'audit_logs',
            'system_settings'
        ];
        for (const table of tables) {
            try {
                const count = await prisma.$queryRaw `
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = ${table} AND table_schema = 'public'
        `;
                if (Array.isArray(count) && count[0] && count[0].count > 0) {
                    console.log(`✅ Таблица ${table} существует`);
                }
                else {
                    console.log(`❌ Таблица ${table} не найдена`);
                }
            }
            catch (error) {
                console.log(`❌ Ошибка при проверке таблицы ${table}:`, error.message);
            }
        }
        console.log('\n🔍 Проверка индексов...');
        const indexes = await prisma.$queryRaw `
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
        console.log(`✅ Найдено ${Array.isArray(indexes) ? indexes.length : 0} индексов`);
        console.log('\n👥 Проверка пользователей...');
        const userCount = await prisma.user.count();
        console.log(`✅ Пользователей в системе: ${userCount}`);
        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: {
                    login: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            });
            users.forEach(user => {
                console.log(`  👤 ${user.login} (${user.role}) - ${user.isActive ? 'активен' : 'неактивен'}`);
            });
        }
        console.log('\n🏭 Проверка складов и материалов...');
        const warehouseCount = await prisma.warehouse.count();
        const materialCount = await prisma.material.count();
        console.log(`✅ Складов: ${warehouseCount}`);
        console.log(`✅ Материалов: ${materialCount}`);
        console.log('\n🏗️ Проверка марок бетона...');
        const gradeCount = await prisma.concreteGrade.count();
        console.log(`✅ Марок бетона: ${gradeCount}`);
        if (gradeCount > 0) {
            const grades = await prisma.concreteGrade.findMany({
                select: {
                    name: true,
                    grade: true,
                    isActive: true,
                },
            });
            grades.forEach(grade => {
                console.log(`  🏗️ ${grade.name} (${grade.grade}) - ${grade.isActive ? 'активна' : 'неактивна'}`);
            });
        }
        console.log('\n⚙️ Проверка системных настроек...');
        const settingsCount = await prisma.systemSetting.count();
        console.log(`✅ Системных настроек: ${settingsCount}`);
        if (settingsCount > 0) {
            const settings = await prisma.systemSetting.findMany({
                select: {
                    key: true,
                    value: true,
                    category: true,
                },
            });
            settings.forEach(setting => {
                console.log(`  ⚙️ ${setting.key}: ${setting.value} (${setting.category})`);
            });
        }
        console.log('\n📊 Проверка производительности...');
        const start = Date.now();
        await prisma.user.findMany({ take: 1 });
        const queryTime = Date.now() - start;
        console.log(`✅ Время выполнения тестового запроса: ${queryTime}ms`);
        if (queryTime > 1000) {
            console.log('⚠️ Медленный запрос! Рекомендуется оптимизация базы данных');
        }
        console.log('\n💾 Информация о размере базы данных...');
        const dbSize = await prisma.$queryRaw `
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size,
        pg_database_size(current_database()) as size_bytes
    `;
        if (Array.isArray(dbSize) && dbSize[0]) {
            console.log(`✅ Размер базы данных: ${dbSize[0].size}`);
        }
        console.log('\n🎉 Проверка базы данных завершена успешно!');
    }
    catch (error) {
        console.error('❌ Ошибка при проверке базы данных:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
verifyDatabase()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=verify-database.js.map