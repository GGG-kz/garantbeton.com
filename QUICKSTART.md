# 🚀 Быстрый запуск

## 1️⃣ Автоматическая настройка (рекомендуется)

### Windows:
```cmd
scripts\setup.bat
```

### Linux/macOS:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## 2️⃣ Ручной запуск

### Шаг 1: Установка зависимостей
```bash
npm run install:all
```

### Шаг 2: Настройка переменных окружения
```bash
# Копируем примеры файлов окружения
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

### Шаг 3: Запуск базы данных
```bash
docker-compose up -d db
```

### Шаг 4: Настройка Prisma
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ..
```

### Шаг 5: Запуск приложения
```bash
npm run dev
```

## 3️⃣ Доступ к приложению

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api/docs

## 4️⃣ Тестовые аккаунты

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

## 5️⃣ PWA установка

1. Откройте http://localhost:3000 в браузере
2. Нажмите на иконку "Установить приложение" в адресной строке
3. Или используйте меню браузера: "Установить приложение"

## ✅ Готово!

Теперь у вас есть полнофункциональное PWA приложение для автоматизации бетонного завода с системой аутентификации и ролями пользователей.
