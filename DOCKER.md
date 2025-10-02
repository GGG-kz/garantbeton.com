# 🐳 Docker Setup

Проект полностью настроен для работы с Docker. Все компоненты (база данных, backend, frontend) могут работать в контейнерах.

## 🚀 Быстрый запуск

### Режим разработки
```bash
# Автоматический запуск
npm run docker:dev

# Или вручную
docker-compose -f docker-compose.dev.yml up --build
```

### Продакшн режим
```bash
# Автоматический запуск
npm run docker:prod

# Или вручную
docker-compose up --build -d
```

## 📋 Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run docker:dev` | Запуск в режиме разработки |
| `npm run docker:prod` | Запуск в продакшн режиме |
| `npm run docker:stop` | Остановка всех контейнеров |
| `npm run docker:logs` | Просмотр логов |
| `npm run docker:clean` | Очистка всех контейнеров и данных |

## 🏗️ Архитектура

### Сервисы
- **db** - PostgreSQL 15 (порт 5432)
- **backend** - NestJS API (порт 4000)
- **frontend** - React PWA с Nginx (порт 3000)

### Сети
- `beton_network` - изолированная сеть для всех сервисов
- `beton_network_dev` - сеть для режима разработки

### Тома
- `postgres_data` - данные PostgreSQL (продакшн)
- `postgres_data_dev` - данные PostgreSQL (разработка)

## 🔧 Конфигурация

### Переменные окружения
Все переменные окружения настроены в docker-compose файлах:

**Backend:**
- `DATABASE_URL` - подключение к PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT
- `PORT` - порт приложения (4000)

**Frontend:**
- `VITE_API_URL` - URL API для фронтенда

### Health Checks
Все сервисы имеют health checks для мониторинга состояния:
- **db**: проверка готовности PostgreSQL
- **backend**: HTTP health check на `/health`
- **frontend**: HTTP health check на `/health`

## 📱 Доступ к приложению

После запуска Docker:

- **Frontend PWA:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Документация:** http://localhost:4000/api/docs
- **Health Check Backend:** http://localhost:4000/health
- **Health Check Frontend:** http://localhost:3000/health

## 🔑 Тестовые аккаунты

| Роль | Логин | Пароль |
|------|-------|--------|
| developer | `developer` | `developer123` |
| admin | `admin` | `admin123` |
| manager | `manager` | `manager123` |
| dispatcher | `dispatcher` | `dispatcher123` |
| driver | `driver` | `driver123` |
| supply | `supply` | `supply123` |
| accountant | `accountant` | `accountant123` |
| director | `director` | `director123` |

## 🛠️ Полезные команды

### Управление контейнерами
```bash
# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Перезапуск сервиса
docker-compose restart backend

# Выполнение команд в контейнере
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma db seed
```

### Очистка
```bash
# Остановка и удаление контейнеров
docker-compose down

# Остановка и удаление контейнеров с томами
docker-compose down -v

# Очистка системы Docker
docker system prune -f
```

## 🚨 Troubleshooting

### Проблемы с портами
Если порты заняты, измените их в docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # frontend
  - "4001:4000"  # backend
  - "5433:5432"  # database
```

### Проблемы с базой данных
```bash
# Сброс базы данных
docker-compose down -v
docker-compose up -d db
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma db seed
```

### Проблемы с кэшем Docker
```bash
# Пересборка без кэша
docker-compose build --no-cache
docker-compose up --build
```

## 🎯 Готово!

Ваше приложение теперь полностью работает в Docker с автоматической настройкой всех компонентов!
