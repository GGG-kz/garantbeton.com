# 🔧 Переменные окружения для Render.com

## 🗄️ Backend Environment Variables

Скопируйте эти переменные в настройки Backend сервиса на Render:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-2025
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-change-this-2025
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=*
LOG_LEVEL=info
```

**⚠️ ВАЖНО**: 
- `DATABASE_URL` будет автоматически установлена Render при подключении базы данных
- Обязательно замените `JWT_SECRET` и `JWT_REFRESH_SECRET` на уникальные значения!

### Генерация секретных ключей:

```bash
# Способ 1: OpenSSL
openssl rand -base64 32

# Способ 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Способ 3: Онлайн генератор
# https://generate-secret.vercel.app/32
```

## 🌐 Frontend Environment Variables

Скопируйте эти переменные в настройки Frontend сервиса на Render:

```
VITE_APP_TITLE=BetonApp
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_API_BASE_URL=https://betonapp-backend.onrender.com
VITE_API_TIMEOUT=30000
VITE_ENABLE_DEBUG=false
VITE_ENABLE_CONSOLE_LOGS=false
VITE_ENABLE_TEST_DATA=false
VITE_PWA_NAME=BetonApp
VITE_PWA_SHORT_NAME=BetonApp
VITE_PWA_DESCRIPTION=Система автоматизации бетонного завода
VITE_PWA_THEME_COLOR=#000000
VITE_PWA_BACKGROUND_COLOR=#ffffff
```

**⚠️ ВАЖНО**: 
- Замените `betonapp-backend` на реальное имя вашего Backend сервиса
- URL будет доступен после создания Backend сервиса

## 🗄️ Database Configuration

При создании PostgreSQL базы данных на Render:

```
Database Name: betonapp_production
User: betonapp_user
```

Render автоматически сгенерирует:
- Пароль базы данных
- CONNECTION_STRING
- Внутренний и внешний URL

## 📋 Пошаговая настройка на Render

### 1. Создание PostgreSQL базы данных

1. **New** → **PostgreSQL**
2. **Name**: `betonapp-database`
3. **Database Name**: `betonapp_production`
4. **User**: `betonapp_user`
5. **Region**: выберите ближайший к вам
6. **Plan**: Starter (бесплатно)

### 2. Создание Backend сервиса

1. **New** → **Web Service**
2. **Connect Repository**: ваш GitHub репозиторий
3. **Name**: `betonapp-backend`
4. **Runtime**: Node
5. **Region**: тот же, что и база данных
6. **Branch**: main
7. **Root Directory**: `backend`
8. **Build Command**: 
   ```
   npm ci && npm run build && npx prisma generate && npx prisma migrate deploy && npm run prisma:seed:prod
   ```
9. **Start Command**: 
   ```
   npm run start:prod
   ```
10. **Plan**: Starter (бесплатно)

#### Environment Variables:
Добавьте все переменные из раздела "Backend Environment Variables" выше.

#### Database Connection:
1. В разделе **Environment Variables**
2. **Add Environment Variable**
3. **Key**: `DATABASE_URL`
4. **Value**: выберите **From Database** → ваша созданная база данных

### 3. Создание Frontend сервиса

1. **New** → **Static Site**
2. **Connect Repository**: ваш GitHub репозиторий
3. **Name**: `betonapp-frontend`
4. **Branch**: main
5. **Root Directory**: `frontend`
6. **Build Command**: 
   ```
   npm ci && npm run build:prod
   ```
7. **Publish Directory**: `dist`

#### Environment Variables:
Добавьте все переменные из раздела "Frontend Environment Variables" выше.

**⚠️ Обновите VITE_API_BASE_URL**: 
После создания Backend сервиса скопируйте его URL и обновите эту переменную.

## 🔄 Автоматическое развертывание

### Включение Auto-Deploy:

1. В настройках каждого сервиса
2. **Settings** → **Auto-Deploy**
3. **Enable Auto-Deploy**: Yes
4. **Branch**: main

Теперь при каждом push в main ветку будет автоматическое развертывание.

## 🔍 Проверка после развертывания

### Backend Health Check:
```bash
curl https://your-backend-name.onrender.com/health
```

### Frontend Check:
```bash
curl https://your-frontend-name.onrender.com
```

### Database Connection Test:
Проверьте логи Backend сервиса на наличие сообщения "Database connected successfully"

## 🚨 Важные замечания

### Безопасность:
1. **Никогда не коммитьте** реальные секретные ключи в репозиторий
2. **Используйте Environment Variables** для всех секретов
3. **Регулярно меняйте** JWT секреты
4. **Ограничьте CORS** после тестирования

### Производительность:
1. **Бесплатные сервисы засыпают** через 15 минут неактивности
2. **Первый запрос** после сна может быть медленным (cold start)
3. **Рассмотрите платный план** для продакшена

### Мониторинг:
1. **Настройте уведомления** о сбоях
2. **Регулярно проверяйте логи**
3. **Мониторьте использование ресурсов**

## 📞 Поддержка

При возникновении проблем:
1. Проверьте **логи сервисов** на Render
2. Убедитесь в **правильности переменных окружения**
3. Проверьте **статус всех сервисов**
4. Обратитесь к **документации Render**: https://render.com/docs

---

**Готово!** Теперь у вас есть все необходимое для развертывания BetonApp на Render.com! 🚀