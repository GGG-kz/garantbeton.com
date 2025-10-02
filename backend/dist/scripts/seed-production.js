"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function seedProduction() {
    console.log('🌱 Инициализация продакшн базы данных...');
    try {
        const adminPassword = await bcrypt.hash('admin123', 12);
        const admin = await prisma.user.upsert({
            where: { login: 'admin' },
            update: {},
            create: {
                login: 'admin',
                password: adminPassword,
                fullName: 'Системный администратор',
                role: 'admin',
                isActive: true,
            },
        });
        console.log('✅ Администратор создан:', admin.login);
        const directorPassword = await bcrypt.hash('director123', 12);
        const director = await prisma.user.upsert({
            where: { login: 'director' },
            update: {},
            create: {
                login: 'director',
                password: directorPassword,
                fullName: 'Директор завода',
                role: 'director',
                isActive: true,
            },
        });
        console.log('✅ Директор создан:', director.login);
        const managerPassword = await bcrypt.hash('manager123', 12);
        const manager = await prisma.user.upsert({
            where: { login: 'manager' },
            update: {},
            create: {
                login: 'manager',
                password: managerPassword,
                fullName: 'Менеджер производства',
                role: 'manager',
                isActive: true,
            },
        });
        console.log('✅ Менеджер создан:', manager.login);
        const mainWarehouse = await prisma.warehouse.upsert({
            where: { id: 'main-warehouse' },
            update: {},
            create: {
                id: 'main-warehouse',
                name: 'Основной склад',
                address: 'г. Алматы, ул. Промышленная, 1',
                capacity: 10000,
                isActive: true,
            },
        });
        console.log('✅ Основной склад создан:', mainWarehouse.name);
        const materials = [
            {
                name: 'Цемент М400',
                unit: 'т',
                category: 'cement',
                warehouseId: mainWarehouse.id,
                quantity: 0,
                minStock: 10,
            },
            {
                name: 'Щебень фр. 5-20',
                unit: 'т',
                category: 'gravel',
                warehouseId: mainWarehouse.id,
                quantity: 0,
                minStock: 50,
            },
            {
                name: 'Песок строительный',
                unit: 'т',
                category: 'sand',
                warehouseId: mainWarehouse.id,
                quantity: 0,
                minStock: 30,
            },
            {
                name: 'Пластификатор',
                unit: 'л',
                category: 'additive',
                warehouseId: mainWarehouse.id,
                quantity: 0,
                minStock: 100,
            },
        ];
        for (const material of materials) {
            const created = await prisma.material.upsert({
                where: { id: `material-${material.category}` },
                update: {},
                create: {
                    id: `material-${material.category}`,
                    ...material,
                },
            });
            console.log('✅ Материал создан:', created.name);
        }
        const concreteGrades = [
            {
                name: 'Бетон М200',
                grade: 'M200',
                cementConsumption: 280,
                gravelConsumption: 1200,
                sandConsumption: 600,
                plasticizerConsumption: 2.8,
                description: 'Для фундаментов малоэтажных зданий',
            },
            {
                name: 'Бетон М300',
                grade: 'M300',
                cementConsumption: 350,
                gravelConsumption: 1150,
                sandConsumption: 580,
                plasticizerConsumption: 3.5,
                description: 'Для монолитных конструкций',
            },
            {
                name: 'Бетон М400',
                grade: 'M400',
                cementConsumption: 420,
                gravelConsumption: 1100,
                sandConsumption: 550,
                plasticizerConsumption: 4.2,
                description: 'Для высоконагруженных конструкций',
            },
        ];
        for (const grade of concreteGrades) {
            const created = await prisma.concreteGrade.upsert({
                where: { grade: grade.grade },
                update: {},
                create: grade,
            });
            console.log('✅ Марка бетона создана:', created.name);
        }
        const systemSettings = [
            {
                key: 'company_name',
                value: 'ТОО "БетонЗавод"',
                type: 'string',
                category: 'general',
            },
            {
                key: 'company_address',
                value: 'г. Алматы, ул. Промышленная, 1',
                type: 'string',
                category: 'general',
            },
            {
                key: 'company_phone',
                value: '+7 (727) 123-45-67',
                type: 'string',
                category: 'general',
            },
            {
                key: 'default_currency',
                value: 'KZT',
                type: 'string',
                category: 'general',
            },
            {
                key: 'backup_enabled',
                value: 'true',
                type: 'boolean',
                category: 'system',
            },
            {
                key: 'notification_enabled',
                value: 'true',
                type: 'boolean',
                category: 'system',
            },
        ];
        for (const setting of systemSettings) {
            const created = await prisma.systemSetting.upsert({
                where: { key: setting.key },
                update: {},
                create: setting,
            });
            console.log('✅ Настройка создана:', created.key);
        }
        console.log('🎉 Продакшн база данных успешно инициализирована!');
        console.log('');
        console.log('📋 Данные для входа:');
        console.log('👤 Администратор: admin / admin123');
        console.log('👤 Директор: director / director123');
        console.log('👤 Менеджер: manager / manager123');
        console.log('');
        console.log('⚠️  ВАЖНО: Обязательно смените пароли после первого входа!');
    }
    catch (error) {
        console.error('❌ Ошибка при инициализации базы данных:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
seedProduction()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed-production.js.map