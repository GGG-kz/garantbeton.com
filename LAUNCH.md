# 🚀 Запуск проекта

## ✅ Статус: Готов к запуску!

Все компоненты проекта настроены и готовы к работе:
- ✅ Backend (NestJS + Prisma + PostgreSQL) 
- ✅ Frontend (React + Vite + TailwindCSS + PWA)
- ✅ Аутентификация с JWT токенами
- ✅ Роли пользователей
- ✅ TypeScript ошибки исправлены

## 🎯 Быстрый запуск

### 1. Запуск базы данных
```bash
docker-compose up -d db
```

### 2. Настройка базы данных
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Запуск приложения
```bash
# Из корневой папки проекта
npm run dev
```

## 🌐 Доступ к приложению

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000  
- **API Документация:** http://localhost:4000/api/docs

## 🔑 Тестовые аккаунты

| Логин | Пароль | Роль |
|-------|--------|------|
| `developer` | `developer123` | Разработчик (с переключением ролей) |
| `admin` | `admin123` | Администратор |
| `manager` | `manager123` | Менеджер |
| `dispatcher` | `dispatcher123` | Диспетчер |
| `driver` | `driver123` | Водитель |
| `supply` | `supply123` | Поставщик |
| `accountant` | `accountant123` | Бухгалтер |
| `director` | `director123` | Директор |

## 📱 PWA возможности

После входа в систему:
1. Откройте меню браузера (три точки)
2. Выберите "Установить приложение" или "Добавить на главный экран"
3. Приложение будет установлено как нативное приложение

## 🛠️ Полезные команды

```bash
# Остановка базы данных
docker-compose down

# Сброс базы данных
cd backend
npx prisma migrate reset

# Просмотр базы данных
npx prisma studio

# Только backend
npm run dev:backend

# Только frontend  
npm run dev:frontend
```

## 🎉 Готово!

Ваше PWA приложение для автоматизации бетонного завода готово к использованию!
