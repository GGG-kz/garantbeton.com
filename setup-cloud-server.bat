@echo off
echo ========================================
echo   Настройка облачного сервера для весов
echo ========================================
echo.

echo [1/5] Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo Скачайте и установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js установлен

echo.
echo [2/5] Установка зависимостей...
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)
echo ✅ Зависимости установлены

echo.
echo [3/5] Создание файла конфигурации...
echo PORT=3001 > .env
echo LOCAL_SCALES_URL=http://localhost:8080 >> .env
echo NODE_ENV=production >> .env
echo ✅ Конфигурация создана

echo.
echo [4/5] Проверка локального сервера весов...
curl -s http://localhost:8080/status >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Локальный сервер весов недоступен на порту 8080
    echo Убедитесь, что scales-http-server.js запущен
) else (
    echo ✅ Локальный сервер весов доступен
)

echo.
echo [5/5] Запуск облачного сервера...
echo.
echo 🌐 Облачный сервер запускается на порту 3001
echo 📡 Локальный сервер весов: http://localhost:8080
echo 🔗 API доступен по адресу: http://localhost:3001/cloud/
echo.
echo Для остановки нажмите Ctrl+C
echo.

node scales-cloud-server.js

pause
