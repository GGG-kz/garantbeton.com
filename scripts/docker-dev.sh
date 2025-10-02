#!/bin/bash

echo "🚀 Запуск проекта в режиме разработки с Docker..."

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose -f docker-compose.dev.yml down

# Сборка и запуск контейнеров
echo "🏗️ Сборка и запуск контейнеров..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Проект запущен!"
echo ""
echo "🌐 Доступ к приложению:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:4000"
echo "   API Docs: http://localhost:4000/api/docs"
echo ""
echo "🔑 Тестовые аккаунты:"
echo "   developer / developer123"
echo "   admin / admin123"
echo "   manager / manager123"
echo "   dispatcher / dispatcher123"
echo "   driver / driver123"
echo "   supply / supply123"
echo "   accountant / accountant123"
echo "   director / director123"
