#!/bin/bash

# Скрипт проверки готовности к продакшену
echo "🔍 Проверка готовности BetonApp к продакшену..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Счетчики
PASSED=0
FAILED=0
WARNINGS=0

# Функции для вывода
check_pass() {
    echo -e "${GREEN}✅ PASS${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC} $1"
    ((WARNINGS++))
}

check_info() {
    echo -e "${BLUE}ℹ️  INFO${NC} $1"
}

echo "=================================="
echo "🔍 Проверка конфигурации"
echo "=================================="

# Проверка файлов конфигурации
if [ -f "backend/.env.production" ]; then
    check_pass "Продакшн конфигурация backend найдена"
else
    check_fail "Отсутствует backend/.env.production"
fi

if [ -f "frontend/.env.production" ]; then
    check_pass "Продакшн конфигурация frontend найдена"
else
    check_fail "Отсутствует frontend/.env.production"
fi

# Проверка секретных ключей
if [ -f "backend/.env.production" ]; then
    if grep -q "CHANGE_THIS" backend/.env.production; then
        check_fail "Обнаружены дефолтные секретные ключи в backend/.env.production"
    else
        check_pass "Секретные ключи в backend/.env.production изменены"
    fi
fi

# Проверка схемы базы данных
if [ -f "backend/prisma/schema.prisma" ]; then
    if grep -q "betonapp_production" backend/prisma/schema.prisma; then
        check_pass "Схема базы данных настроена для продакшена"
    else
        check_warn "Схема базы данных может не быть настроена для продакшена"
    fi
else
    check_fail "Отсутствует схема базы данных"
fi

echo ""
echo "=================================="
echo "🏗️ Проверка сборки"
echo "=================================="

# Проверка сборки backend
if [ -d "backend/dist" ]; then
    check_pass "Backend собран"
else
    check_fail "Backend не собран (запустите: cd backend && npm run build)"
fi

# Проверка сборки frontend
if [ -d "frontend/dist" ]; then
    check_pass "Frontend собран"
else
    check_fail "Frontend не собран (запустите: cd frontend && npm run build)"
fi

# Проверка мобильных проектов
if [ -d "frontend/android" ]; then
    check_pass "Android проект создан"
else
    check_warn "Android проект не создан (запустите: cd frontend && npx cap add android)"
fi

if [ -d "frontend/ios" ]; then
    check_pass "iOS проект создан"
else
    check_warn "iOS проект не создан (запустите: cd frontend && npx cap add ios)"
fi

echo ""
echo "=================================="
echo "🐳 Проверка Docker"
echo "=================================="

# Проверка Docker файлов
if [ -f "docker-compose.production.yml" ]; then
    check_pass "Docker Compose конфигурация найдена"
else
    check_fail "Отсутствует docker-compose.production.yml"
fi

if [ -f "backend/Dockerfile.production" ]; then
    check_pass "Backend Dockerfile найден"
else
    check_fail "Отсутствует backend/Dockerfile.production"
fi

if [ -f "frontend/Dockerfile.production" ]; then
    check_pass "Frontend Dockerfile найден"
else
    check_fail "Отсутствует frontend/Dockerfile.production"
fi

# Проверка Docker
if command -v docker &> /dev/null; then
    check_pass "Docker установлен"
    
    if docker info &> /dev/null; then
        check_pass "Docker запущен"
    else
        check_fail "Docker не запущен"
    fi
else
    check_warn "Docker не установлен"
fi

# Проверка Docker Compose
if command -v docker-compose &> /dev/null; then
    check_pass "Docker Compose установлен"
else
    check_warn "Docker Compose не установлен"
fi

echo ""
echo "=================================="
echo "🔒 Проверка безопасности"
echo "=================================="

# Проверка SSL сертификатов
if [ -d "nginx/ssl" ]; then
    if [ -f "nginx/ssl/cert.pem" ] && [ -f "nginx/ssl/key.pem" ]; then
        check_pass "SSL сертификаты найдены"
    else
        check_fail "SSL сертификаты не найдены в nginx/ssl/"
    fi
else
    check_fail "Директория nginx/ssl не существует"
fi

# Проверка прав доступа
if [ -f "backend/.env.production" ]; then
    PERMS=$(stat -c "%a" backend/.env.production 2>/dev/null || stat -f "%A" backend/.env.production 2>/dev/null)
    if [ "$PERMS" = "600" ]; then
        check_pass "Права доступа к .env.production настроены правильно"
    else
        check_warn "Рекомендуется установить права 600 для backend/.env.production"
    fi
fi

echo ""
echo "=================================="
echo "📊 Проверка зависимостей"
echo "=================================="

# Проверка Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js установлен: $NODE_VERSION"
else
    check_fail "Node.js не установлен"
fi

# Проверка npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm установлен: $NPM_VERSION"
else
    check_fail "npm не установлен"
fi

# Проверка PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | head -n1)
    check_pass "PostgreSQL CLI установлен: $PSQL_VERSION"
else
    check_warn "PostgreSQL CLI не установлен"
fi

echo ""
echo "=================================="
echo "📱 Проверка мобильного приложения"
echo "=================================="

# Проверка Capacitor
if [ -f "frontend/capacitor.config.ts" ]; then
    check_pass "Capacitor настроен"
else
    check_fail "Capacitor не настроен"
fi

# Проверка Android SDK (если есть)
if [ -n "$ANDROID_HOME" ]; then
    check_pass "Android SDK настроен: $ANDROID_HOME"
else
    check_warn "Android SDK не настроен (переменная ANDROID_HOME)"
fi

# Проверка Xcode (только на macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcodebuild &> /dev/null; then
        XCODE_VERSION=$(xcodebuild -version | head -n1)
        check_pass "Xcode установлен: $XCODE_VERSION"
    else
        check_warn "Xcode не установлен"
    fi
fi

echo ""
echo "=================================="
echo "📋 Итоговый отчет"
echo "=================================="

echo -e "${GREEN}✅ Пройдено: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Предупреждений: $WARNINGS${NC}"
echo -e "${RED}❌ Ошибок: $FAILED${NC}"

echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 Отлично! Приложение полностью готово к продакшену!${NC}"
        echo ""
        echo "Следующие шаги:"
        echo "1. Разверните на сервере: docker-compose -f docker-compose.production.yml up -d"
        echo "2. Проверьте работу: curl -f http://localhost/health"
        echo "3. Настройте мониторинг: http://localhost:3001 (Grafana)"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Приложение готово к продакшену с предупреждениями${NC}"
        echo "Рекомендуется устранить предупреждения перед развертыванием"
        exit 0
    fi
else
    echo -e "${RED}❌ Приложение НЕ готово к продакшену!${NC}"
    echo "Необходимо устранить все ошибки перед развертыванием"
    exit 1
fi