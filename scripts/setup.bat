@echo off
echo 🚀 Настройка проекта Бетонный завод...

REM Установка зависимостей
echo 📦 Установка зависимостей...
npm run install:all

REM Копирование файлов окружения
echo ⚙️ Настройка переменных окружения...
if not exist backend\.env (
    copy backend\env.example backend\.env
    echo ✅ Создан backend\.env
) else (
    echo ⚠️ backend\.env уже существует
)

if not exist frontend\.env (
    copy frontend\env.example frontend\.env
    echo ✅ Создан frontend\.env
) else (
    echo ⚠️ frontend\.env уже существует
)

REM Запуск базы данных
echo 🗄️ Запуск PostgreSQL...
docker-compose up -d db

REM Ожидание запуска базы данных
echo ⏳ Ожидание запуска базы данных...
timeout /t 10 /nobreak

REM Настройка Prisma
echo 🔧 Настройка Prisma...
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..

echo ✅ Настройка завершена!
echo.
echo Для запуска проекта выполните:
echo   npm run dev
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:4000
echo API Docs: http://localhost:4000/api/docs
pause
