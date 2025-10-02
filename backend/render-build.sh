#!/bin/bash

# Скрипт сборки для Render.com
echo "🚀 Начинаем сборку BetonApp Backend для Render..."

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm ci --only=production

# Сборка TypeScript
echo "🔨 Сборка TypeScript..."
npm run build

# Генерация Prisma Client
echo "🗄️ Генерация Prisma Client..."
npx prisma generate

# Применение миграций базы данных
echo "📊 Применение миграций базы данных..."
npx prisma migrate deploy

# Инициализация начальных данных
echo "🌱 Инициализация начальных данных..."
npm run prisma:seed:prod

echo "✅ Сборка завершена успешно!"