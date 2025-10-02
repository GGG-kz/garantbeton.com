#!/bin/bash

echo "🚀 Настройка проекта Бетонный завод..."

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm run install:all

# Копирование файлов окружения
echo "⚙️ Настройка переменных окружения..."
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "✅ Создан backend/.env"
else
    echo "⚠️ backend/.env уже существует"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/env.example frontend/.env
    echo "✅ Создан frontend/.env"
else
    echo "⚠️ frontend/.env уже существует"
fi

# Запуск базы данных
echo "🗄️ Запуск PostgreSQL..."
docker-compose up -d db

# Ожидание запуска базы данных
echo "⏳ Ожидание запуска базы данных..."
sleep 10

# Настройка Prisma
echo "🔧 Настройка Prisma..."
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..

echo "✅ Настройка завершена!"
echo ""
echo "Для запуска проекта выполните:"
echo "  npm run dev"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:4000"
echo "API Docs: http://localhost:4000/api/docs"
