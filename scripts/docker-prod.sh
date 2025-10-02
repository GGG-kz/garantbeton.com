#!/bin/bash

echo "🚀 Запуск проекта в продакшн режиме с Docker..."

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Сборка и запуск контейнеров
echo "🏗️ Сборка и запуск контейнеров..."
docker-compose up --build -d

# Ожидание запуска базы данных
echo "⏳ Ожидание запуска базы данных..."
sleep 10

# Выполнение миграций и seed
echo "🗄️ Выполнение миграций и seed..."
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

echo "✅ Проект запущен в продакшн режиме!"
echo ""
echo "🌐 Доступ к приложению:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:4000"
echo "   API Docs: http://localhost:4000/api/docs"
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps
