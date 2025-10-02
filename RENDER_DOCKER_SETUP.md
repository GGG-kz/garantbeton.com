# 🐳 Настройка Render с Docker

## 🔧 Исправление проблемы с Docker

Render использует Docker, но не может найти папки из-за неправильного контекста. Исправлено!

## 📋 Настройка Backend в Render

### 1. Создание Web Service
1. **New +** → **Web Service**
2. **Connect GitHub** → `garantbeton.com`
3. **Branch:** `main`
4. **Root Directory:** оставить пустым (корень репозитория)
5. **Dockerfile:** `Dockerfile.backend`
6. **Build Command:** (оставить пустым - Docker сам соберет)
7. **Start Command:** (оставить пустым - Docker сам запустит)

### 2. Переменные окружения Backend
```
DATABASE_URL=postgresql://betonapp_db_user:TyEeViHksHlSSLvCa2rtXglshMtIzpx8@dpg-d3fbiovfte5s73a0ecog-a.oregon-postgres.render.com/betonapp_db
JWT_SECRET=Z4v!nP7eQ9rT2@xH6kC8$yB1uM0gW5jR3dL7
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=N8kT!yQ2rF6mA3zG7bJ9cL0xH4vE5uP1sR7
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://garantbeton.com
DB_POOL_SIZE=20
DB_CONNECTION_TIMEOUT=30000
LOG_LEVEL=info
```

## 📱 Настройка Frontend в Render

### 1. Создание Web Service
1. **New +** → **Web Service**
2. **Connect GitHub** → `garantbeton.com`
3. **Branch:** `main`
4. **Root Directory:** оставить пустым (корень репозитория)
5. **Dockerfile:** `Dockerfile.frontend`
6. **Build Command:** (оставить пустым)
7. **Start Command:** (оставить пустым)

### 2. Переменные окружения Frontend
```
VITE_API_URL=https://your-backend-service.onrender.com/api
VITE_APP_NAME=BetonApp
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_PWA_NAME=BetonApp
VITE_PWA_SHORT_NAME=BetonApp
VITE_PWA_DESCRIPTION=Система автоматизации бетонного завода
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

## 🚀 Альтернативный способ - без Docker

Если Docker не работает, можно использовать обычную сборку:

### Backend (без Docker):
- **Root Directory:** `backend`
- **Build Command:** `npm run build`
- **Start Command:** `npm run start:prod`

### Frontend (без Docker):
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

## 🔄 Обновленные Dockerfile

### Backend (`Dockerfile.backend`):
- ✅ Копирует из `backend/` папки
- ✅ Правильный контекст для Render
- ✅ Multi-stage build
- ✅ Prisma генерация
- ✅ Health checks

### Frontend (`Dockerfile.frontend`):
- ✅ Копирует из `frontend/` папки
- ✅ Nginx для статики
- ✅ PWA поддержка
- ✅ Health checks

## 🧪 Тестирование

После настройки:

1. **Backend Health:** `https://your-backend-service.onrender.com/health`
2. **API Docs:** `https://your-backend-service.onrender.com/api/docs`
3. **Frontend:** `https://your-frontend-service.onrender.com`
4. **PWA:** Установка приложения

## ✅ Готово!

Теперь Render должен успешно собрать и запустить приложение с Docker!

**Попробуйте снова деплой с обновленными настройками!** 🎯
