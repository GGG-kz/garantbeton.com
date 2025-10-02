# Скрипт для настройки переменных окружения Java
# Запустите этот скрипт с правами администратора

Write-Host "Настройка переменных окружения для Java..." -ForegroundColor Green

# Путь к Java
$javaPath = "C:\Users\Gabdol\Java\java-21-openjdk-21.0.4.0.7-1.win.jdk.x86_64"

# Проверяем существование Java
if (Test-Path $javaPath) {
    Write-Host "Java найдена в: $javaPath" -ForegroundColor Green
    
    # Устанавливаем JAVA_HOME для текущего пользователя
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    Write-Host "JAVA_HOME установлен для пользователя" -ForegroundColor Green
    
    # Добавляем Java в PATH для текущего пользователя
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $javaBinPath = "$javaPath\bin"
    
    if ($currentPath -notlike "*$javaBinPath*") {
        $newPath = "$currentPath;$javaBinPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        Write-Host "Java добавлена в PATH для пользователя" -ForegroundColor Green
    } else {
        Write-Host "Java уже в PATH" -ForegroundColor Yellow
    }
    
    Write-Host "Переменные окружения настроены!" -ForegroundColor Green
    Write-Host "Перезапустите PowerShell для применения изменений" -ForegroundColor Yellow
    
} else {
    Write-Host "Java не найдена в: $javaPath" -ForegroundColor Red
    Write-Host "Убедитесь, что Java установлена правильно" -ForegroundColor Red
}

Write-Host "Для проверки выполните: java -version" -ForegroundColor Cyan

