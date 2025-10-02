# Скрипт для проверки установки всех компонентов
Write-Host "🔍 Проверка установки компонентов для мобильной разработки..." -ForegroundColor Cyan
Write-Host "=" * 60

# Проверка Java
Write-Host "`n☕ Проверка Java:" -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    if ($javaVersion -match "version") {
        Write-Host "✅ Java установлена" -ForegroundColor Green
        $javaVersion[0] | Write-Host -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Java не найдена" -ForegroundColor Red
    Write-Host "Запустите setup-java-env.ps1 с правами администратора" -ForegroundColor Yellow
}

# Проверка Node.js и npm
Write-Host "`n📦 Проверка Node.js:" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не найден" -ForegroundColor Red
}

# Проверка Capacitor
Write-Host "`n⚡ Проверка Capacitor:" -ForegroundColor Yellow
try {
    $capVersion = npx cap --version
    Write-Host "✅ Capacitor: $capVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Capacitor не найден" -ForegroundColor Red
}

# Проверка Android SDK
Write-Host "`n📱 Проверка Android SDK:" -ForegroundColor Yellow
$androidHome = $env:ANDROID_HOME
if ($androidHome -and (Test-Path $androidHome)) {
    Write-Host "✅ ANDROID_HOME: $androidHome" -ForegroundColor Green
    
    # Проверка ADB
    try {
        $adbVersion = adb version 2>&1
        Write-Host "✅ ADB доступен" -ForegroundColor Green
    } catch {
        Write-Host "❌ ADB не найден в PATH" -ForegroundColor Red
    }
    
    # Проверка эмулятора
    try {
        $emulatorVersion = emulator -version 2>&1
        Write-Host "✅ Emulator доступен" -ForegroundColor Green
    } catch {
        Write-Host "❌ Emulator не найден в PATH" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ ANDROID_HOME не настроен" -ForegroundColor Red
    Write-Host "Запустите setup-android-env.ps1 после установки Android Studio" -ForegroundColor Yellow
}

# Проверка проекта
Write-Host "`n🏗️ Проверка проекта BetonAPP:" -ForegroundColor Yellow
if (Test-Path "frontend\package.json") {
    Write-Host "✅ Frontend проект найден" -ForegroundColor Green
    
    # Проверка Android проекта
    if (Test-Path "frontend\android") {
        Write-Host "✅ Android проект настроен" -ForegroundColor Green
    } else {
        Write-Host "❌ Android проект не найден" -ForegroundColor Red
    }
    
    # Проверка iOS проекта
    if (Test-Path "frontend\ios") {
        Write-Host "✅ iOS проект настроен" -ForegroundColor Green
    } else {
        Write-Host "❌ iOS проект не найден" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Frontend проект не найден" -ForegroundColor Red
    Write-Host "Убедитесь, что вы находитесь в корневой папке проекта" -ForegroundColor Yellow
}

# Проверка Capacitor Doctor
Write-Host "`n🩺 Capacitor Doctor:" -ForegroundColor Yellow
try {
    npx cap doctor
} catch {
    Write-Host "❌ Не удалось запустить cap doctor" -ForegroundColor Red
}

Write-Host "`n" + "=" * 60
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "1. Запустите setup-java-env.ps1 с правами администратора" -ForegroundColor White
}

if (-not $env:ANDROID_HOME) {
    Write-Host "2. Установите Android Studio с https://developer.android.com/studio" -ForegroundColor White
    Write-Host "3. Запустите setup-android-env.ps1" -ForegroundColor White
}

if ((Get-Command java -ErrorAction SilentlyContinue) -and $env:ANDROID_HOME) {
    Write-Host "🎉 Все готово! Можете запускать:" -ForegroundColor Green
    Write-Host "   npm run mobile:android" -ForegroundColor White
    Write-Host "   npm run mobile:run:android" -ForegroundColor White
}

