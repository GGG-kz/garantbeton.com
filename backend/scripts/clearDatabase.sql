-- Скрипт для полной очистки базы данных PostgreSQL
-- Удаляет все данные кроме пользователя разработчика

-- Проверяем текущие данные
SELECT 'Пользователей в базе:' as info, COUNT(*) as count FROM "User";

-- Показываем всех пользователей
SELECT 'Текущие пользователи:' as info;
SELECT id, login, role, "createdAt" FROM "User";

-- Удаляем всех пользователей кроме разработчика
DELETE FROM "User" WHERE role != 'developer';

-- Проверяем результат
SELECT 'Пользователей после очистки:' as info, COUNT(*) as count FROM "User";

-- Показываем оставшихся пользователей
SELECT 'Оставшиеся пользователи:' as info;
SELECT id, login, role, "createdAt" FROM "User";

-- Если есть другие таблицы, очищаем их
-- (раскомментируйте по необходимости)

-- Очистка внутренних заявок (если таблица существует)
-- DELETE FROM "InternalRequest";

-- Очистка заказов (если таблица существует)  
-- DELETE FROM "ConcreteOrder";

-- Очистка накладных (если таблица существует)
-- DELETE FROM "ExpenseInvoice";

SELECT 'Очистка базы данных завершена!' as result;

