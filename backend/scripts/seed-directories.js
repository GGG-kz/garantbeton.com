const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDirectories() {
  try {
    console.log('🌱 Заполняем справочники начальными данными...');

    // Контрагенты
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
        notes: 'Крупный клиент, постоянные заказы'
      },
      {
        name: 'ТОО "БетонСервис"',
        fullName: 'Товарищество с ограниченной ответственностью "БетонСервис"',
        type: 'supplier',
        contactPerson: 'Петров Петр Петрович',
        phone: '+7 (727) 234-56-78',
        email: 'petrov@betonservice.kz',
        address: 'г. Алматы, ул. Сатпаева, 90',
        inn: '987654321098',
        kpp: '987654321',
        bankAccount: 'KZ987654321098765432',
        notes: 'Поставщик цемента и добавок'
      },
      {
        name: 'ИП "Смирнов"',
        fullName: 'Индивидуальный предприниматель Смирнов Алексей Владимирович',
        type: 'client',
        contactPerson: 'Смирнов Алексей Владимирович',
        phone: '+7 (701) 345-67-89',
        email: 'smirnov@mail.ru',
        address: 'г. Алматы, ул. Достык, 200',
        inn: '111222333444',
        notes: 'Частный застройщик'
      }
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
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Контрагент "${counterparty.name}" уже существует, пропускаем`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Контрагенты созданы');

    // Марки бетона
    const concreteGrades = [
      {
        name: 'М100',
        description: 'Товарный бетон М100',
        strength: '100 кг/см²',
        mobility: 'П2-П3',
        frostResistance: 'F50',
        waterResistance: 'W2',
        price: 15000
      },
      {
        name: 'М150',
        description: 'Товарный бетон М150',
        strength: '150 кг/см²',
        mobility: 'П2-П3',
        frostResistance: 'F75',
        waterResistance: 'W4',
        price: 18000
      },
      {
        name: 'М200',
        description: 'Товарный бетон М200',
        strength: '200 кг/см²',
        mobility: 'П2-П3',
        frostResistance: 'F100',
        waterResistance: 'W4',
        price: 21000
      },
      {
        name: 'М250',
        description: 'Товарный бетон М250',
        strength: '250 кг/см²',
        mobility: 'П2-П3',
        frostResistance: 'F100',
        waterResistance: 'W6',
        price: 24000
      },
      {
        name: 'М300',
        description: 'Товарный бетон М300',
        strength: '300 кг/см²',
        mobility: 'П2-П3',
        frostResistance: 'F150',
        waterResistance: 'W6',
        price: 27000
      }
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
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Марка бетона "${grade.name}" уже существует, пропускаем`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Марки бетона созданы');

    // Склады
    const warehouses = [
      {
        name: 'Склад №1 (Центральный)',
        address: 'г. Алматы, ул. Абая, 150',
        capacity: 1000,
        currentStock: 750,
        manager: 'Козлов Сергей Александрович',
        phone: '+7 (777) 111-22-33'
      },
      {
        name: 'Склад №2 (Северный)',
        address: 'г. Алматы, ул. Сатпаева, 90',
        capacity: 800,
        currentStock: 600,
        manager: 'Новикова Елена Петровна',
        phone: '+7 (777) 222-33-44'
      },
      {
        name: 'Склад №3 (Южный)',
        address: 'г. Алматы, ул. Достык, 200',
        capacity: 600,
        currentStock: 400,
        manager: 'Морозов Дмитрий Игоревич',
        phone: '+7 (777) 333-44-55'
      }
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
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Склад "${warehouse.name}" уже существует, пропускаем`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Склады созданы');

    // Материалы
    const materials = [
      {
        name: 'Цемент ПЦ 400',
        type: 'cement',
        unit: 'ton',
        price: 45000,
        supplier: 'ТОО "БетонСервис"',
        description: 'Портландцемент марки 400'
      },
      {
        name: 'Песок речной',
        type: 'sand',
        unit: 'm3',
        price: 8000,
        supplier: 'ООО "ПесокСтрой"',
        description: 'Речной песок фракции 0-5мм'
      },
      {
        name: 'Щебень гранитный',
        type: 'gravel',
        unit: 'm3',
        price: 12000,
        supplier: 'ТОО "ЩебеньКаз"',
        description: 'Гранитный щебень фракции 5-20мм'
      },
      {
        name: 'Вода техническая',
        type: 'water',
        unit: 'liter',
        price: 50,
        supplier: 'Водоканал',
        description: 'Техническая вода для производства'
      },
      {
        name: 'Пластификатор С-3',
        type: 'additive',
        unit: 'kg',
        price: 500,
        supplier: 'ТОО "ХимДобавки"',
        description: 'Пластифицирующая добавка'
      }
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
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Материал "${material.name}" уже существует, пропускаем`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Материалы созданы');

    console.log('\n🎉 Справочники успешно заполнены!');
    console.log('\n📋 Создано:');
    console.log(`- Контрагенты: ${counterparties.length}`);
    console.log(`- Марки бетона: ${concreteGrades.length}`);
    console.log(`- Склады: ${warehouses.length}`);
    console.log(`- Материалы: ${materials.length}`);

  } catch (error) {
    console.error('❌ Ошибка при заполнении справочников:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDirectories();
