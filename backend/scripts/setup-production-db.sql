-- Скрипт создания продакшн базы данных BetonApp

-- Создание пользователя базы данных
CREATE USER betonapp_user WITH PASSWORD 'secure_password_2025';

-- Создание базы данных
CREATE DATABASE betonapp_production 
  WITH OWNER = betonapp_user
       ENCODING = 'UTF8'
       LC_COLLATE = 'ru_RU.UTF-8'
       LC_CTYPE = 'ru_RU.UTF-8'
       TEMPLATE = template0;

-- Предоставление прав
GRANT ALL PRIVILEGES ON DATABASE betonapp_production TO betonapp_user;

-- Подключение к базе данных
\c betonapp_production;

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Предоставление прав на схему
GRANT ALL ON SCHEMA public TO betonapp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO betonapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO betonapp_user;

-- Настройка прав по умолчанию
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO betonapp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO betonapp_user;

-- Создание функции для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Комментарии к базе данных
COMMENT ON DATABASE betonapp_production IS 'Продакшн база данных системы автоматизации бетонного завода BetonApp';

-- Настройки производительности для продакшена
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Перезагрузка конфигурации
SELECT pg_reload_conf();