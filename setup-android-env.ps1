# Скрипт для настройки переменных окружения Android
# Запустите этот скрипт ПОСЛЕ установки Android Studio

Write-Host "Настройка переменных окружения для Android..." -ForegroundColor Green

# Ищем Android SDK в стандартных местах
$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "C:\Android\Sdk",
    "C:\Program Files\Android\Android Studio\sdk",
    "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
)

$androidSdkPath = $null

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $androidSdkPath = $path
        Write-Host "Android SDK найден в: $path" -ForegroundColor Green
        break
    }
}

if ($androidSdkPath) {
    # Устанавливаем ANDROID_HOME
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")
    Write-Host "ANDROID_HOME установлен: $androidSdkPath" -ForegroundColor Green
    
    # Добавляем Android tools в PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $pathsToAdd = @(
        "$androidSdkPath\platform-tools",
        "$androidSdkPath\emulator",
        "$androidSdkPath\tools",
        "$androidSdkPath\tools\bin"
    )
    
    foreach ($pathToAdd in $pathsToAdd) {
        if (Test-Path $pathToAdd -and $currentPath -notlike "*$pathToAdd*") {
            $currentPath += ";$pathToAdd"
            Write-Host "Добавлен в PATH: $pathToAdd" -ForegroundColor Green
        }
    }
    
    [Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")
    
    Write-Host "Переменные окружения Android настроены!" -ForegroundColor Green
    Write-Host "Перезапустите PowerShell для применения изменений" -ForegroundColor Yellow
    
    # Проверяем доступные инструменты
    Write-Host "`nПроверка доступных инструментов:" -ForegroundColor Cyan
    
    $platformTools = "$androidSdkPath\platform-tools\adb.exe"
    if (Test-Path $platformTools) {
        Write-Host "✅ ADB найден" -ForegroundColor Green
    } else {
        Write-Host "❌ ADB не найден" -ForegroundColor Red
    }
    
    $emulator = "$androidSdkPath\emulator\emulator.exe"
    if (Test-Path $emulator) {
        Write-Host "✅ Emulator найден" -ForegroundColor Green
    } else {
        Write-Host "❌ Emulator не найден" -ForegroundColor Red
    }
    
} else {
    Write-Host "Android SDK не найден!" -ForegroundColor Red
    Write-Host "Убедитесь, что Android Studio установлен и SDK скачан" -ForegroundColor Yellow
    Write-Host "Возможные пути:" -ForegroundColor Yellow
    foreach ($path in $possiblePaths) {
        Write-Host "  - $path" -ForegroundColor Gray
    }
}

Write-Host "`nДля проверки выполните:" -ForegroundColor Cyan
Write-Host "  adb version" -ForegroundColor White
Write-Host "  npx cap doctor" -ForegroundColor White

