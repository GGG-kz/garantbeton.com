#!/bin/bash

# Скрипт сборки для Render.com
echo "🚀 Начинаем сборку BetonApp Frontend для Render..."

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm ci --only=production

# Очистка тестовых данных (если есть утилита)
echo "🧹 Очистка тестовых данных..."
if [ -f "src/utils/clearAllTestData.ts" ]; then
    echo "Тестовые данные будут очищены в браузере"
fi

# Сборка для продакшена
echo "🔨 Сборка для продакшена..."
npm run build:prod

echo "✅ Сборка завершена успешно!"
echo "📁 Статические файлы готовы в ./dist"