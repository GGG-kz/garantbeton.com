# 🌐 Переменные окружения для Render

## 📋 Backend Environment Variables

Добавьте эти переменные в Render Dashboard для Backend сервиса:

| NAME_OF_VARIABLE       | VALUE                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| DATABASE_URL           | `postgresql://betonapp_db_user:TyEeViHksHlSSLvCa2rtXglshMtIzpx8@dpg-d3fbiovfte5s73a0ecog-a.oregon-postgres.render.com/betonapp_db` |
| JWT_SECRET             | `Z4v!nP7eQ9rT2@xH6kC8$yB1uM0gW5jR3dL7`                                                                                             |
| JWT_EXPIRES_IN         | `15m`                                                                                                                              |
| JWT_REFRESH_SECRET     | `N8kT!yQ2rF6mA3zG7bJ9cL0xH4vE5uP1sR7`                                                                                              |
| JWT_REFRESH_EXPIRES_IN | `7d`                                                                                                                               |
| PORT                   | `3000`                                                                                                                             |
| NODE_ENV               | `production`                                                                                                                       |
| BCRYPT_ROUNDS          | `12`                                                                                                                               |
| CORS_ORIGIN            | `https://garantbeton.com` (или Render-URL фронтенда, если домен ещё не привязан)                                                   |
| DB_POOL_SIZE           | `20`                                                                                                                               |
| DB_CONNECTION_TIMEOUT  | `30000`                                                                                                                            |
| LOG_LEVEL              | `info`                                                                                                                             |

## 📱 Frontend Environment Variables

Добавьте эти переменные в Render Dashboard для Frontend сервиса:

| NAME_OF_VARIABLE       | VALUE                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| VITE_API_URL           | `https://your-backend-service.onrender.com/api`                      |
| VITE_APP_NAME          | `BetonApp`                                                            |
| VITE_APP_VERSION       | `1.0.0`                                                               |
| VITE_APP_ENV           | `production`                                                          |
| VITE_PWA_NAME          | `BetonApp`                                                            |
| VITE_PWA_SHORT_NAME    | `BetonApp`                                                            |
| VITE_PWA_DESCRIPTION   | `Система автоматизации бетонного завода`                             |
| VITE_ENABLE_ANALYTICS  | `false`                                                               |
| VITE_ENABLE_DEBUG      | `false`                                                               |

## 🔧 Настройка в Render Dashboard

### 1. Backend Service
1. Перейти в [Render Dashboard](https://dashboard.render.com)
2. Выбрать ваш Backend сервис
3. Перейти в раздел "Environment"
4. Добавить все переменные из таблицы выше

### 2. Frontend Service
1. Выбрать ваш Frontend сервис
2. Перейти в раздел "Environment"
3. Добавить все переменные из таблицы выше
4. **ВАЖНО:** Замените `your-backend-service.onrender.com` на реальный URL вашего Backend сервиса

## 🚀 Build Commands

### Backend
```bash
# Build Command
npm run build

# Start Command
npm run start:prod
```

### Frontend
```bash
# Build Command
npm run build

# Publish Directory
dist
```

## 🔐 Безопасность

- ✅ Все секреты хранятся в переменных окружения Render
- ✅ Никогда не коммитить `.env.production` в Git
- ✅ Использовать HTTPS для всех сервисов
- ✅ Настроить CORS правильно

## 📊 Проверка

После настройки проверьте:

1. **Backend Health:** `https://your-backend-service.onrender.com/health`
2. **API Docs:** `https://your-backend-service.onrender.com/api/docs`
3. **Frontend:** `https://your-frontend-service.onrender.com`
4. **PWA:** Установка приложения на устройство

## 🆘 Troubleshooting

### Backend не запускается
- Проверьте все переменные окружения
- Убедитесь что DATABASE_URL правильный
- Проверьте логи в Render Dashboard

### Frontend не работает
- Проверьте VITE_API_URL
- Убедитесь что Backend доступен
- Проверьте CORS настройки

### База данных недоступна
- Проверьте статус PostgreSQL в Render
- Убедитесь что DATABASE_URL правильный
- Проверьте подключение к базе данных
