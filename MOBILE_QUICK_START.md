# 🚀 Быстрый запуск мобильного приложения

## ⚡ За 5 минут до мобильного приложения!

### 1️⃣ Установка (один раз)

#### Android
```bash
# Скачайте и установите Android Studio
# https://developer.android.com/studio

# Создайте эмулятор или подключите устройство
```

#### iOS (только на macOS)
```bash
# Установите Xcode из App Store
# Запустите Xcode и согласитесь с лицензией
```

### 2️⃣ Запуск приложения

```bash
cd frontend

# Для Android
npm run mobile:android

# Для iOS (только на macOS)
npm run mobile:ios
```

### 3️⃣ Что происходит?

1. **Сборка веб-приложения** (`npm run build`)
2. **Копирование в нативные проекты** (`npx cap sync`)
3. **Открытие IDE** (Android Studio или Xcode)
4. **Запуск на устройстве/эмуляторе**

## 📱 Результат

✅ **Полноценное мобильное приложение** с:
- Нативной навигацией
- Адаптивным интерфейсом  
- Доступом к камере и файлам
- Офлайн работой
- Push уведомлениями

## 🎯 Основные команды

```bash
# Быстрая сборка и синхронизация
npm run mobile:build

# Запуск на Android
npm run mobile:run:android

# Запуск на iOS  
npm run mobile:run:ios

# Открыть Android Studio
npm run mobile:android

# Открыть Xcode
npm run mobile:ios
```

## 🔧 Если что-то не работает

```bash
# Проверка конфигурации
npx cap doctor

# Очистка кэша
npx cap clean

# Обновление плагинов
npx cap update
```

## 📞 Нужна помощь?

- 📖 Полная документация: `MOBILE_APP_GUIDE.md`
- 🌐 Официальная документация: https://capacitorjs.com/docs
- 🛠️ Диагностика: `npx cap doctor`

---

**Готово!** 🎉 Ваше веб-приложение теперь работает как нативное мобильное приложение!