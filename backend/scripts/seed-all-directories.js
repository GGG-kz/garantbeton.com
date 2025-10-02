const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAllDirectories() {
  try {
    console.log('🌱 Заполняем все справочники начальными данными...');

    // ===== КОНТРАГЕНТЫ =====
    const counterparties = [
      {
        name: 'ООО "СтройМир"',
        fullName: 'Общество с ограниченной ответственностью "СтройМир"',
        type: 'client',
        contactPerson: 'Иванов Иван Иванович',
        phone: '+7 (777) 123-45-67',
        email: 'ivanov@stroymir.kz',
        address: 'г. Алматы, ул. Абая, 150',
        inn: '123456789012',
        kpp: '123456789',
        bankAccount: 'KZ123456789012345678',
        notes: 'Крупный клиент, постоянные заказы',
      },
      {
        name: 'ТОО "БетонСервис"',
        fullName: 'Товарищество с ограниченной ответственностью "БетонСервис"',
        type: 'supplier',
        contactPerson: 'Петров Петр Петрович',
        phone: '+7 (707) 987-65-43',
        email: 'petrov@betonservice.kz',
        address: 'г. Алматы, ул. Саина, 200',
        inn: '987654321098',
        kpp: '987654321',
        bankAccount: 'KZ987654321098765432',
        notes: 'Надежный поставщик цемента и добавок',
      },
      {
        name: 'ИП "Смирнов"',
        fullName: 'Индивидуальный предприниматель Смирнов А.В.',
        type: 'client',
        contactPerson: 'Смирнов Алексей Викторович',
        phone: '+7 (701) 555-66-77',
        email: 'smirnov@mail.kz',
        address: 'г. Алматы, мкр. Орбита-3, 10',
        inn: '111222333444',
        notes: 'Частный застройщик',
      },
    ];

    for (const counterparty of counterparties) {
      try {
        await prisma.counterparty.create({
          data: {
            ...counterparty,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ Контрагент "${counterparty.name}" создан`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Контрагент "${counterparty.name}" уже существует`);
        } else {
          throw error;
        }
      }
    }

    // ===== МАРКИ БЕТОНА =====
    const concreteGrades = [
      {
        name: 'М100',
        description: 'Легкий бетон для подготовительных работ',
        strength: 'B7.5',
        mobility: 'П2-П4',
        frostResistance: 'F50',
        waterResistance: 'W2',
        price: 15000,
      },
      {
        name: 'М150',
        description: 'Для стяжек и фундаментов под легкие конструкции',
        strength: 'B10',
        mobility: 'П2-П4',
        frostResistance: 'F75',
        waterResistance: 'W4',
        price: 18000,
      },
      {
        name: 'М200',
        description: 'Универсальный бетон для фундаментов, стяжек, дорожек',
        strength: 'B15',
        mobility: 'П2-П4',
        frostResistance: 'F100',
        waterResistance: 'W4',
        price: 21000,
      },
      {
        name: 'М250',
        description: 'Для монолитных фундаментов, плит перекрытий, лестниц',
        strength: 'B20',
        mobility: 'П2-П4',
        frostResistance: 'F150',
        waterResistance: 'W6',
        price: 24000,
      },
      {
        name: 'М300',
        description: 'Высокопрочный бетон для несущих конструкций, дорог',
        strength: 'B22.5',
        mobility: 'П2-П4',
        frostResistance: 'F200',
        waterResistance: 'W6',
        price: 27000,
      },
    ];

    for (const grade of concreteGrades) {
      try {
        await prisma.concreteGrade.create({
          data: {
            ...grade,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ Марка бетона "${grade.name}" создана`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Марка бетона "${grade.name}" уже существует`);
        } else {
          throw error;
        }
      }
    }

    // ===== СКЛАДЫ =====
    const warehouses = [
      {
        name: 'Склад №1 (Центральный)',
        address: 'г. Алматы, ул. Центральная, 1',
        capacity: 1000,
        currentStock: 750,
        phone: '+7 (777) 111-22-33',
      },
      {
        name: 'Склад №2 (Северный)',
        address: 'г. Алматы, ул. Северная, 50',
        capacity: 800,
        currentStock: 600,
        phone: '+7 (701) 222-33-44',
      },
      {
        name: 'Склад №3 (Южный)',
        address: 'г. Алматы, ул. Южная, 120',
        capacity: 600,
        currentStock: 400,
        phone: '+7 (777) 333-44-55',
      },
    ];

    for (const warehouse of warehouses) {
      try {
        await prisma.warehouse.create({
          data: {
            ...warehouse,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ Склад "${warehouse.name}" создан`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Склад "${warehouse.name}" уже существует`);
        } else {
          throw error;
        }
      }
    }

    // ===== МАТЕРИАЛЫ =====
    const materials = [
      {
        name: 'Цемент ПЦ 400',
        type: 'cement',
        unit: 'ton',
        price: 45000,
        supplier: 'ТОО "ЦементПром"',
        description: 'Портландцемент марки 400',
      },
      {
        name: 'Песок речной',
        type: 'sand',
        unit: 'm3',
        price: 8000,
        supplier: 'ТОО "ПесокКарьер"',
        description: 'Мытый речной песок',
      },
      {
        name: 'Щебень гранитный',
        type: 'gravel',
        unit: 'm3',
        price: 12000,
        supplier: 'ТОО "ЩебеньПлюс"',
        description: 'Фракция 5-20 мм',
      },
      {
        name: 'Вода техническая',
        type: 'water',
        unit: 'liter',
        price: 50,
        supplier: 'ГорВодоКанал',
        description: 'Вода для технических нужд',
      },
      {
        name: 'Пластификатор С-3',
        type: 'additive',
        unit: 'kg',
        price: 500,
        supplier: 'ТОО "ХимДобавки"',
        description: 'Пластифицирующая добавка',
      },
    ];

    for (const material of materials) {
      try {
        await prisma.material.create({
          data: {
            ...material,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ Материал "${material.name}" создан`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Материал "${material.name}" уже существует`);
        } else {
          throw error;
        }
      }
    }

    // ===== ТРАНСПОРТ =====
    const transports = [
      {
        name: 'Миксер №1',
        type: 'mixer',
        model: 'КАМАЗ-53228',
        licensePlate: '123ABC01',
        capacity: 7.0,
        year: 2020,
        vin: 'X9F12345678901234',
        status: 'active',
        notes: 'Основной миксер для доставки бетона',
      },
      {
        name: 'Миксер №2',
        type: 'mixer',
        model: 'КАМАЗ-53228',
        licensePlate: '456DEF02',
        capacity: 7.0,
        year: 2019,
        vin: 'X9F98765432109876',
        status: 'active',
        notes: 'Резервный миксер',
      },
      {
        name: 'Грузовик №1',
        type: 'truck',
        model: 'ЗИЛ-130',
        licensePlate: '789GHI03',
        capacity: 5.0,
        year: 2018,
        status: 'maintenance',
        notes: 'На техническом обслуживании',
      },
      {
        name: 'Кран №1',
        type: 'crane',
        model: 'КС-3577',
        licensePlate: '012JKL04',
        capacity: 16.0,
        year: 2021,
        status: 'active',
        notes: 'Автокран для подъема материалов',
      },
    ];

    for (const transport of transports) {
      try {
        await prisma.transport.create({
          data: {
            ...transport,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ Транспорт "${transport.name}" создан`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Транспорт "${transport.name}" уже существует`);
        } else {
          throw error;
        }
      }
    }

    // ===== ВОДИТЕЛИ =====
    const drivers = [
      {
        name: 'Иванов И.И.',
        fullName: 'Иванов Иван Иванович',
        phone: '+7 (777) 111-11-11',
        login: 'driver1',
        tempPassword: 'temp123',
        hasChangedPassword: false,
        licenseNumber: '1234567890',
        licenseExpiry: new Date('2025-12-31'),
        vehicleIds: [],
        status: 'active',
      },
      {
        name: 'Петров П.П.',
        fullName: 'Петров Петр Петрович',
        phone: '+7 (777) 222-22-22',
        login: 'driver2',
        tempPassword: 'temp456',
        hasChangedPassword: false,
        licenseNumber: '0987654321',
        licenseExpiry: new Date('2026-06-15'),
        vehicleIds: [],
        status: 'active',
      },
      {
        name: 'Сидоров С.С.',
        fullName: 'Сидоров Сергей Сергеевич',
        phone: '+7 (777) 333-33-33',
        login: 'driver3',
        tempPassword: 'temp789',
        hasChangedPassword: false,
        licenseNumber: '1122334455',
        licenseExpiry: new Date('2025-03-20'),
        status: 'vacation',
      },
    ];

    for (const driver of drivers) {
      try {
        await prisma.driver.create({
          data: {
            ...driver,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ Водитель "${driver.name}" создан`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Водитель "${driver.name}" уже существует`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n🎉 Все справочники успешно заполнены!');
    console.log('\n📋 Создано:');
    console.log(`- Контрагенты: ${counterparties.length}`);
    console.log(`- Марки бетона: ${concreteGrades.length}`);
    console.log(`- Склады: ${warehouses.length}`);
    console.log(`- Материалы: ${materials.length}`);
    console.log(`- Транспорт: ${transports.length}`);
    console.log(`- Водители: ${drivers.length}`);

  } catch (error) {
    console.error('❌ Ошибка при заполнении справочников:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAllDirectories();
