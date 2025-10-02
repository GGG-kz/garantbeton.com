# Руководство по установке Android Studio и настройке среды разработки

## 🚀 Шаг 1: Установка Java (УЖЕ ВЫПОЛНЕНО ✅)

Java 21 уже установлена в: `C:\Users\Gabdol\Java\java-21-openjdk-21.0.4.0.7-1.win.jdk.x86_64`

### Настройка переменных окружения:
1. Запустите PowerShell **с правами администратора**
2. Выполните: `.\setup-java-env.ps1`
3. Перезапустите PowerShell
4. Проверьте: `java -version`

## 📱 Шаг 2: Установка Android Studio

### Автоматическая загрузка:
1. Откройте браузер и перейдите на: https://developer.android.com/studio
2. Нажмите "Download Android Studio"
3. Скачайте установщик (около 1 ГБ)

### Установка:
1. Запустите скачанный файл `android-studio-*.exe`
2. Выберите "Standard" установку
3. Установите в папку по умолчанию: `C:\Program Files\Android\Android Studio`
4. ✅ Отметьте все компоненты:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
   - Performance (Intel HAXM)

### Первый запуск:
1. Запустите Android Studio
2. Выберите "Do not import settings"
3. Пройдите мастер настройки (SDK будет скачан автоматически)
4. Установите все рекомендуемые компоненты SDK

## 🔧 Шаг 3: Настройка переменных окружения Android

После установки Android Studio выполните:

```powershell
# Установите переменные окружения (замените YOUR_USERNAME на ваше имя)
$env:ANDROID_HOME = "C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"

# Добавьте в системные переменные:
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $env:ANDROID_HOME, "User")
```

## 🍎 Шаг 4: iOS разработка (опционально)

### Для iOS разработки нужен Mac с Xcode
- Xcode можно установить только на macOS
- Для Windows доступна только разработка под Android

### CocoaPods (если есть Mac):
```bash
sudo gem install cocoapods
```

## ✅ Шаг 5: Проверка установки

После установки Android Studio проверьте:

```bash
# Проверка Java
java -version

# Проверка Android SDK (после установки Android Studio)
adb version

# Проверка Capacitor
npx cap doctor
```

## 🚀 Шаг 6: Запуск мобильного приложения

```bash
# Перейдите в папку frontend
cd frontend

# Соберите проект
npm run build

# Синхронизируйте с мобильными платформами
npx cap sync

# Откройте Android Studio
npm run mobile:android

# Или запустите на устройстве/эмуляторе
npm run mobile:run:android
```

## 📋 Системные требования

- **Windows**: 10/11 (64-bit)
- **RAM**: минимум 8 ГБ, рекомендуется 16 ГБ
- **Диск**: минимум 4 ГБ свободного места
- **Процессор**: Intel x64 или AMD x64

## 🆘 Решение проблем

### Проблема: "java не является внутренней или внешней командой"
**Решение**: Перезапустите PowerShell после настройки переменных окружения

### Проблема: "ANDROID_HOME не найден"
**Решение**: Убедитесь, что Android Studio установлен и SDK скачан

### Проблема: "HAXM не установлен"
**Решение**: Включите виртуализацию в BIOS и переустановите HAXM

## 📞 Поддержка

Если возникли проблемы, проверьте:
1. Все компоненты установлены
2. Переменные окружения настроены
3. PowerShell перезапущен
4. Права администратора для установки

