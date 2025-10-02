# 🏭 Бетонный завод - PWA приложение

Современная система автоматизации бетонного завода с Progressive Web App интерфейсом.

## ✨ Возможности

- 🔐 **Аутентификация** - JWT токены с refresh механизмом
- 👥 **Роли пользователей** - 8 различных ролей с разными правами доступа
- 📱 **PWA** - Установка на рабочий стол и мобильные устройства
- 🎨 **Современный UI** - TailwindCSS с адаптивным дизайном
- ⚡ **Высокая производительность** - React + Vite
- 🔄 **Автообновление** - Service Worker для офлайн режима

## 🏗️ Архитектура

### Backend (NestJS + Prisma + PostgreSQL)
- RESTful API с Swagger документацией
- JWT аутентификация с refresh токенами
- Ролевая система доступа
- Валидация данных с class-validator
- TypeScript для типобезопасности

### Frontend (React + Vite + TailwindCSS)
- SPA с React Router
- Zustand для управления состоянием
- React Hook Form + Zod для валидации
- PWA с Service Worker
- Адаптивный дизайн

## 👥 Роли пользователей

| Роль | Описание | Особенности |
|------|----------|-------------|
| `developer` | Разработчик | Полный доступ + переключение ролей |
| `admin` | Администратор | Управление пользователями |
| `manager` | Менеджер | Управление производством |
| `dispatcher` | Диспетчер | Координация доставки |
| `driver` | Водитель | Управление доставкой |
| `supply` | Поставщик | Управление поставками |
| `accountant` | Бухгалтер | Финансовый учет |
| `director` | Директор | Стратегическое планирование |
| `operator` | Оператор | Материалы, марки бетона, заявки |
| `cook` | Повар | Внутренние заявки, мессенджер |

## 🚀 Быстрый старт

### 🐳 Docker (рекомендуется)

**Режим разработки:**
```bash
npm run docker:dev
```

**Продакшн режим:**
```bash
npm run docker:prod
```

### 📦 Локальная установка

**Автоматическая настройка:**

**Windows:**
```bash
scripts\setup.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Ручная настройка:**

1. **Установка зависимостей:**
```bash
npm run install:all
```

2. **Настройка окружения:**
```bash
# Backend
cp backend/env.example backend/.env
# Frontend  
cp frontend/env.example frontend/.env
```

3. **Запуск базы данных:**
```bash
docker-compose up -d db
```

4. **Настройка Prisma:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ..
```

5. **Запуск проекта:**
```bash
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
| `supply` | `supply123` | Снабженец |
| `accountant` | `accountant123` | Бухгалтер |
| `director` | `director123` | Директор |
| `operator` | `operator123` | Оператор |
| `cook` | `cook123` | Повар |

## 📱 PWA возможности

- **Установка** - Добавление на рабочий стол и домашний экран
- **Офлайн режим** - Кэширование ресурсов через Service Worker
- **Push уведомления** - Готовность к интеграции
- **Быстрый доступ** - Ярлыки для основных функций
- **Адаптивность** - Оптимизация для всех устройств

## 🛠️ Разработка

### Структура проекта
```
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Аутентификация
│   │   ├── users/          # Пользователи
│   │   └── prisma/         # База данных
│   └── prisma/             # Схема и миграции
├── frontend/               # React PWA
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы
│   │   ├── stores/         # Zustand stores
│   │   ├── api/            # API клиент
│   │   └── types/          # TypeScript типы
│   └── public/             # Статические файлы
└── scripts/                # Скрипты настройки
```

### Полезные команды

```bash
# Разработка
npm run dev                 # Запуск frontend + backend
npm run dev:frontend       # Только frontend
npm run dev:backend        # Только backend

# Сборка
npm run build              # Сборка всего проекта

# База данных
cd backend
npx prisma studio         # GUI для базы данных
npx prisma migrate reset  # Сброс миграций
```

## 🔧 Настройка

### Переменные окружения

**Backend (.env):**
```env
DATABASE_URL="postgresql://beton_user:beton_password@localhost:5432/beton_app"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=4000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:4000/api
```

## 📋 Требования

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей.
