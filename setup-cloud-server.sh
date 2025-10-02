#!/bin/bash

echo "========================================"
echo "  Настройка облачного сервера для весов"
echo "========================================"
echo

echo "[1/5] Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo "Установите Node.js:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  CentOS/RHEL: sudo yum install nodejs npm"
    echo "  Или скачайте с https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js установлен: $(node --version)"

echo
echo "[2/5] Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей"
    exit 1
fi
echo "✅ Зависимости установлены"

echo
echo "[3/5] Создание файла конфигурации..."
cat > .env << EOF
PORT=3001
LOCAL_SCALES_URL=http://localhost:8080
NODE_ENV=production
EOF
echo "✅ Конфигурация создана"

echo
echo "[4/5] Проверка локального сервера весов..."
if curl -s http://localhost:8080/status > /dev/null 2>&1; then
    echo "✅ Локальный сервер весов доступен"
else
    echo "⚠️  Локальный сервер весов недоступен на порту 8080"
    echo "Убедитесь, что scales-http-server.js запущен"
fi

echo
echo "[5/5] Запуск облачного сервера..."
echo
echo "🌐 Облачный сервер запускается на порту 3001"
echo "📡 Локальный сервер весов: http://localhost:8080"
echo "🔗 API доступен по адресу: http://localhost:3001/cloud/"
echo
echo "Для остановки нажмите Ctrl+C"
echo

node scales-cloud-server.js
