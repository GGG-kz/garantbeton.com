# 🚀 Развертывание BetonApp на Render.com

## 📋 Пошаговая инструкция

### 1. Подготовка репозитория

```bash
# Убедитесь, что все файлы закоммичены
git add .
git commit -m "Подготовка к развертыванию на Render"
git push origin main
```

### 2. Создание аккаунта на Render

1. Перейдите на [render.com](https://render.com)
2. Зарегистрируйтесь через GitHub
3. Подключите ваш репозиторий

### 3. Автоматическое развертывание

#### Вариант A: Через render.yaml (Рекомендуется)

1. **Создайте новый Blueprint** на Render
2. **Подключите репозиторий** с файлом `render.yaml`
3. **Render автоматически создаст**:
   - PostgreSQL базу данных
   - Backend API сервис
   - Frontend статический сайт

#### Вариант B: Ручное создание сервисов

### 4. Создание базы данных

1. **New** → **PostgreSQL**
2. **Name**: `betonapp-database`
3. **Database Name**: `betonapp_production`
4. **User**: `betonapp_user`
5. **Plan**: Starter (бесплатно)

### 5. Создание Backend сервиса

1. **New** → **Web Service**
2. **Connect Repository**: выберите ваш репозиторий
3. **Name**: `betonapp-backend`
4. **Runtime**: Node
5. **Root Directory**: `backend`
6. **Build Command**: 
   ```bash
   npm ci && npm run build && npx prisma generate && npx prisma migrate deploy && npm run prisma:seed:prod
   ```
7. **Start Command**: 
   ```bash
   npm run start:prod
   ```
8. **Plan**: Starter (бесплатно)

#### Environment Variables для Backend:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Скопируйте из созданной базы данных]
JWT_SECRET=[Сгенерируйте уникальный ключ]
JWT_REFRESH_SECRET=[Сгенерируйте уникальный ключ]
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=*
LOG_LEVEL=info
```

### 6. Создание Frontend сервиса

1. **New** → **Static Site**
2. **Connect Repository**: выберите ваш репозиторий
3. **Name**: `betonapp-frontend`
4. **Root Directory**: `frontend`
5. **Build Command**: 
   ```bash
   npm ci && npm run build:prod
   ```
6. **Publish Directory**: `dist`

#### Environment Variables для Frontend:
```
VITE_APP_TITLE=BetonApp
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_API_BASE_URL=https://betonapp-backend.onrender.com
VITE_API_TIMEOUT=30000
VITE_ENABLE_DEBUG=false
VITE_ENABLE_CONSOLE_LOGS=false
VITE_ENABLE_TEST_DATA=false
```

## 🔧 Настройка после развертывания

### 1. Проверка работы сервисов

```bash
# Проверка Backend API
curl https://betonapp-backend.onrender.com/health

# Проверка Frontend
curl https://betonapp-frontend.onrender.com
```

### 2. Настройка домена (опционально)

1. В настройках Frontend сервиса
2. **Custom Domains** → **Add Custom Domain**
3. Настройте DNS записи у вашего провайдера

### 3. Настройка HTTPS

Render автоматически предоставляет SSL сертификаты для всех сервисов.

## 📊 Мониторинг и логи

### Просмотр логов:
1. Откройте сервис на Render
2. Перейдите в **Logs**
3. Мониторьте работу в реальном времени

### Метрики:
1. **Metrics** → просмотр использования ресурсов
2. **Events** → история развертываний

## 🔄 Обновления

### Автоматические обновления:
1. Включите **Auto-Deploy** в настройках сервиса
2. При каждом push в main ветку будет автоматическое развертывание

### Ручное обновление:
1. **Manual Deploy** → **Deploy Latest Commit**

## 💰 Стоимость

### Бесплатный план включает:
- ✅ **PostgreSQL**: 1GB хранилища
- ✅ **Web Service**: 512MB RAM, засыпает через 15 мин неактивности
- ✅ **Static Site**: неограниченная пропускная способность
- ✅ **SSL сертификаты**: автоматически
- ✅ **Custom domains**: до 1 домена

### Платные планы:
- **Starter ($7/месяц)**: без засыпания, больше ресурсов
- **Standard ($25/месяц)**: еще больше ресурсов
- **Pro ($85/месяц)**: максимальная производительность

## 🛠️ Устранение неполадок

### Частые проблемы:

#### 1. Ошибка сборки Backend
```bash
# Проверьте логи сборки
# Убедитесь, что все зависимости в package.json
# Проверьте переменные окружения
```

#### 2. Ошибка подключения к базе данных
```bash
# Проверьте DATABASE_URL
# Убедитесь, что база данных создана
# Проверьте миграции Prisma
```

#### 3. Frontend не загружается
```bash
# Проверьте VITE_API_BASE_URL
# Убедитесь, что сборка прошла успешно
# Проверьте логи сборки
```

#### 4. CORS ошибки
```bash
# Обновите CORS_ORIGIN в Backend
# Проверьте URL Frontend сервиса
```

### Полезные команды:

```bash
# Проверка статуса всех сервисов
curl -I https://betonapp-backend.onrender.com/health
curl -I https://betonapp-frontend.onrender.com

# Просмотр логов через CLI (если установлен)
render logs betonapp-backend
render logs betonapp-frontend
```

## 📱 Мобильное приложение

После развертывания веб-версии:

1. **Обновите API URL** в мобильном приложении:
   ```typescript
   // В capacitor.config.ts
   server: {
     url: 'https://betonapp-frontend.onrender.com'
   }
   ```

2. **Пересоберите мобильное приложение**:
   ```bash
   cd frontend
   npm run mobile:build:prod
   ```

## 🎉 Готово!

После успешного развертывания у вас будет:

- ✅ **Backend API**: `https://betonapp-backend.onrender.com`
- ✅ **Frontend Web**: `https://betonapp-frontend.onrender.com`
- ✅ **PostgreSQL**: автоматически настроена
- ✅ **SSL**: автоматически включен
- ✅ **Мониторинг**: встроенный в Render

### Доступ к приложению:
- **Веб-версия**: https://betonapp-frontend.onrender.com
- **API документация**: https://betonapp-backend.onrender.com/docs
- **Логин**: admin / admin123 (смените пароль!)

**BetonApp успешно развернут на Render.com!** 🚀