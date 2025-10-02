# 🚀 Настройка продакшена BetonApp

## 📋 Предварительные требования

1. **База данных Render PostgreSQL** - уже настроена
2. **Переменные окружения** - файлы `.env.production` созданы
3. **GitHub репозиторий** - проект загружен

## 🔧 Настройка базы данных

### 1. Проверка подключения
```bash
cd backend
# Установить переменную окружения для продакшена
$env:DATABASE_URL="postgresql://betonapp_db_user:TyEeViHksHlSSLvCa2rtXglshMtIzpx8@dpg-d3fbiovfte5s73a0ecog-a.oregon-postgres.render.com/betonapp_db"

# Проверить подключение
npm run db:check:prod
```

### 2. Настройка базы данных
```bash
# Полная настройка продакшена
npm run db:setup:prod
```

Этот скрипт выполнит:
- ✅ Проверку подключения к базе данных
- ✅ Применение миграций (создание таблиц)
- ✅ Генерацию Prisma клиента
- ✅ Заполнение тестовыми данными

## 🌐 Настройка Render

### 1. Создание Web Service
1. Зайти в [Render Dashboard](https://dashboard.render.com)
2. Нажать "New +" → "Web Service"
3. Подключить GitHub репозиторий `garantbeton.com`
4. Выбрать ветку `main`

### 2. Настройки Build
```bash
# Build Command
npm run build

# Start Command
npm run start:prod
```

### 3. Переменные окружения
Добавить в Render Dashboard:

```env
# Database
DATABASE_URL=postgresql://betonapp_db_user:TyEeViHksHlSSLvCa2rtXglshMtIzpx8@dpg-d3fbiovfte5s73a0ecog-a.oregon-postgres.render.com/betonapp_db

# JWT
JWT_SECRET=Z4v!nP7eQ9rT2@xH6kC8$yB1uM0gW5jR3dL7
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=N8kT!yQ2rF6mA3zG7bJ9cL0xH4vE5uP1sR7
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=production

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-frontend-domain.com

# Performance
DB_POOL_SIZE=20
DB_CONNECTION_TIMEOUT=30000

# Logging
LOG_LEVEL=info
```

## 📱 Настройка Frontend

### 1. Создание Static Site
1. В Render Dashboard → "New +" → "Static Site"
2. Подключить GitHub репозиторий
3. Выбрать папку `frontend`
4. Настроить Build Command: `npm run build`

### 2. Переменные окружения Frontend
```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
VITE_APP_NAME=BetonApp
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_PWA_NAME=BetonApp
VITE_PWA_SHORT_NAME=BetonApp
VITE_PWA_DESCRIPTION=Система автоматизации бетонного завода
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

## 🔄 Деплой

### 1. Автоматический деплой
После настройки Render будет автоматически деплоить при каждом push в `main` ветку.

### 2. Ручной деплой
```bash
# Обновить код
git add .
git commit -m "Update for production"
git push origin main

# Render автоматически начнет деплой
```

## 🧪 Тестирование

### 1. Проверка Backend
```bash
# Проверить API
curl https://your-backend-domain.onrender.com/api/health

# Проверить Swagger
https://your-backend-domain.onrender.com/api/docs
```

### 2. Проверка Frontend
- Открыть https://your-frontend-domain.onrender.com
- Проверить PWA установку
- Протестировать все функции

## 🔐 Безопасность

### 1. HTTPS
- Render автоматически предоставляет HTTPS
- Обновить `CORS_ORIGIN` на реальный домен

### 2. Секреты
- Все секреты хранятся в переменных окружения Render
- Никогда не коммитить `.env.production` в Git

## 📊 Мониторинг

### 1. Логи
- Backend логи доступны в Render Dashboard
- Frontend логи в браузере (F12)

### 2. База данных
- Мониторинг в Render Dashboard
- Резервные копии настраиваются автоматически

## 🆘 Устранение неполадок

### 1. Backend не запускается
```bash
# Проверить логи в Render Dashboard
# Убедиться что все переменные окружения установлены
# Проверить подключение к базе данных
```

### 2. Frontend не работает
```bash
# Проверить что VITE_API_URL правильный
# Убедиться что backend доступен
# Проверить CORS настройки
```

### 3. База данных недоступна
```bash
# Проверить статус базы данных в Render
# Убедиться что DATABASE_URL правильный
# Проверить подключение локально
```

## ✅ Готово!

После выполнения всех шагов у вас будет:
- 🌐 Рабочий Backend API на Render
- 📱 PWA Frontend на Render
- 🗄️ База данных PostgreSQL на Render
- 🔐 Безопасная конфигурация
- 📊 Мониторинг и логи

**Проект готов к продакшену!** 🎉
