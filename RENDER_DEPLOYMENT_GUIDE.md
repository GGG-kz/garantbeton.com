# 🚀 Полное руководство по деплою на Render

## 📋 Предварительные требования

- ✅ GitHub репозиторий: `https://github.com/GGG-kz/garantbeton.com`
- ✅ База данных PostgreSQL на Render
- ✅ Все переменные окружения готовы

## 🗄️ 1. Настройка базы данных

### Проверка подключения
```bash
cd backend
# Установить переменную окружения
$env:DATABASE_URL="postgresql://betonapp_db_user:TyEeViHksHlSSLvCa2rtXglshMtIzpx8@dpg-d3fbiovfte5s73a0ecog-a.oregon-postgres.render.com/betonapp_db"

# Проверить подключение
npm run db:check:prod

# Настроить базу данных (миграции + данные)
npm run db:setup:prod
```

## 🌐 2. Создание Backend сервиса

### В Render Dashboard:
1. **New +** → **Web Service**
2. **Connect GitHub** → выбрать `garantbeton.com`
3. **Branch:** `main`
4. **Root Directory:** `backend`
5. **Build Command:** `npm run build`
6. **Start Command:** `npm run start:prod`

### Переменные окружения Backend:
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

## 📱 3. Создание Frontend сервиса

### В Render Dashboard:
1. **New +** → **Static Site**
2. **Connect GitHub** → выбрать `garantbeton.com`
3. **Branch:** `main`
4. **Root Directory:** `frontend`
5. **Build Command:** `npm run build`
6. **Publish Directory:** `dist`

### Переменные окружения Frontend:
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

## 🔧 4. Настройка домена (опционально)

### Если есть собственный домен:
1. В настройках сервиса → **Custom Domains**
2. Добавить `garantbeton.com`
3. Настроить DNS записи
4. Обновить `CORS_ORIGIN` в Backend

## 🧪 5. Тестирование

### Проверка Backend:
```bash
# Health check
curl https://your-backend-service.onrender.com/health

# API документация
https://your-backend-service.onrender.com/api/docs

# Проверка переменных окружения
npm run env:check
```

### Проверка Frontend:
- Открыть URL фронтенда
- Проверить PWA установку
- Протестировать все функции
- Проверить подключение к API

## 🔄 6. Автоматический деплой

После настройки Render будет автоматически деплоить при каждом push в `main` ветку:

```bash
# Обновить код
git add .
git commit -m "Update for production"
git push origin main

# Render автоматически начнет деплой
```

## 📊 7. Мониторинг

### Логи:
- **Backend:** Render Dashboard → Service → Logs
- **Frontend:** Render Dashboard → Service → Logs

### Метрики:
- **CPU/Memory:** Render Dashboard → Service → Metrics
- **Database:** Render Dashboard → Database → Metrics

## 🆘 8. Устранение неполадок

### Backend не запускается:
```bash
# Проверить логи
# Убедиться что все переменные окружения установлены
# Проверить подключение к базе данных
npm run db:check:prod
```

### Frontend не работает:
- Проверить `VITE_API_URL`
- Убедиться что Backend доступен
- Проверить CORS настройки

### База данных недоступна:
- Проверить статус PostgreSQL в Render
- Убедиться что `DATABASE_URL` правильный
- Проверить подключение локально

## ✅ 9. Готово!

После выполнения всех шагов у вас будет:
- 🌐 **Backend API** на Render
- 📱 **PWA Frontend** на Render  
- 🗄️ **PostgreSQL** на Render
- 🔐 **Безопасная конфигурация**
- 📊 **Мониторинг и логи**

**Проект готов к продакшену!** 🎉

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Render Dashboard
2. Убедитесь что все переменные окружения установлены
3. Проверьте подключение к базе данных
4. Обратитесь к документации Render
