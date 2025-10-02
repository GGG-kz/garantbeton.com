# ☁️ Настройка облачного сервера для весов

## 🎯 Цель
Обеспечить доступ к весам через мобильный интернет для водителей, работающих вдали от Wi-Fi сети склада.

## 🏗️ Архитектура решения

```
[Водитель с мобильным] ← 4G/5G → [Облачный сервер] ← Интернет → [Компьютер с весами]
                                      ↓
                              [WebSocket/HTTP API]
                                      ↓
                              [Локальный сервер весов] ← COM3 → [Физические весы]
```

## 📋 Компоненты системы

### 1. Локальный сервер весов (уже настроен)
- **Файл**: `scales-http-server.js`
- **Порт**: 8080
- **Подключение**: COM3 к весам
- **Функция**: Управление физическими весами

### 2. Облачный сервер (новый)
- **Файл**: `scales-cloud-server.js`
- **Порт**: 3001
- **Функция**: Промежуточный сервер для мобильного доступа

### 3. Мобильное приложение (обновлено)
- **Файл**: `frontend/src/pages/DriverScalesPage.tsx`
- **Функция**: Автоматическое переключение между Wi-Fi и мобильным интернетом

## 🚀 Установка облачного сервера

### Вариант 1: Локальный сервер с внешним IP

#### 1. Настройка роутера
```bash
# Откройте порты на роутере:
# - 3001 (облачный сервер)
# - 8080 (локальный сервер весов, опционально)
```

#### 2. Установка зависимостей
```bash
# Скопируйте файлы на компьютер с весами
cp scales-cloud-server.js /path/to/scales/computer/
cp cloud-server-package.json /path/to/scales/computer/package.json

# Установите зависимости
npm install

# Или с PM2 для автозапуска
npm install -g pm2
```

#### 3. Настройка переменных окружения
```bash
# Создайте .env файл
cat > .env << EOF
PORT=3001
LOCAL_SCALES_URL=http://localhost:8080
NODE_ENV=production
EOF
```

#### 4. Запуск сервера
```bash
# Обычный запуск
npm start

# Или с PM2 (рекомендуется)
pm2 start scales-cloud-server.js --name scales-cloud
pm2 startup
pm2 save
```

### Вариант 2: Облачный хостинг (рекомендуется)

#### 1. Выберите хостинг-провайдера
- **DigitalOcean** (от $5/месяц)
- **AWS EC2** (от $3.50/месяц)
- **Google Cloud** (от $5/месяц)
- **VPS в России** (от 300₽/месяц)

#### 2. Создание сервера
```bash
# Создайте Ubuntu 20.04+ сервер
# Подключитесь по SSH
ssh root@your-server-ip

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите PM2
sudo npm install -g pm2
```

#### 3. Развертывание приложения
```bash
# Создайте директорию
mkdir -p /opt/scales-cloud
cd /opt/scales-cloud

# Загрузите файлы
wget https://your-repo/scales-cloud-server.js
wget https://your-repo/cloud-server-package.json

# Переименуйте package.json
mv cloud-server-package.json package.json

# Установите зависимости
npm install

# Настройте переменные окружения
cat > .env << EOF
PORT=3001
LOCAL_SCALES_URL=http://YOUR_WAREHOUSE_IP:8080
NODE_ENV=production
EOF
```

#### 4. Настройка брандмауэра
```bash
# Откройте порт 3001
sudo ufw allow 3001
sudo ufw enable
```

#### 5. Запуск с PM2
```bash
# Запустите сервер
pm2 start scales-cloud-server.js --name scales-cloud

# Настройте автозапуск
pm2 startup
pm2 save

# Проверьте статус
pm2 status
```

## 🔧 Настройка локального сервера

### Обновите локальный сервер весов
```javascript
// В scales-http-server.js добавьте CORS для облачного сервера
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-cloud-server.com'],
  credentials: true
}));
```

### Настройте сетевой доступ
```bash
# Убедитесь, что локальный сервер доступен извне
# Проверьте IP адрес компьютера
ip addr show

# Настройте статический IP или резервирование DHCP
```

## 📱 Настройка мобильного приложения

### Обновите адрес облачного сервера
```typescript
// В DriverScalesPage.tsx
const [scalesServerUrl, setScalesServerUrl] = useState('https://your-cloud-server.com:3001');
```

### Настройте автоматическое переключение
Приложение автоматически:
1. Проверяет доступность локального сервера (Wi-Fi)
2. Если недоступен - переключается на облачный (мобильный интернет)
3. Отображает тип подключения пользователю

## 🔒 Безопасность

### SSL сертификат (обязательно для HTTPS)
```bash
# Установите Certbot
sudo apt install certbot

# Получите сертификат
sudo certbot certonly --standalone -d your-cloud-server.com

# Настройте автообновление
sudo crontab -e
# Добавьте: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Настройка Nginx (рекомендуется)
```nginx
# /etc/nginx/sites-available/scales-cloud
server {
    listen 443 ssl;
    server_name your-cloud-server.com;

    ssl_certificate /etc/letsencrypt/live/your-cloud-server.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-cloud-server.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Мониторинг

### PM2 мониторинг
```bash
# Просмотр логов
pm2 logs scales-cloud

# Мониторинг в реальном времени
pm2 monit

# Перезапуск сервера
pm2 restart scales-cloud
```

### Проверка работы
```bash
# Проверьте статус облачного сервера
curl https://your-cloud-server.com:3001/cloud/status

# Проверьте подключение к локальному серверу
curl https://your-cloud-server.com:3001/cloud/weight
```

## 💰 Стоимость решения

### Вариант 1: Локальный сервер
- **Стоимость**: Бесплатно
- **Требования**: Статический IP, настройка роутера
- **Сложность**: Средняя

### Вариант 2: Облачный хостинг
- **Стоимость**: от 300₽/месяц
- **Требования**: Регистрация домена
- **Сложность**: Низкая

## 🎯 Преимущества решения

1. **Гибкость**: Работает и через Wi-Fi, и через мобильный интернет
2. **Надежность**: Автоматическое переключение между режимами
3. **Безопасность**: SSL шифрование, контроль доступа
4. **Масштабируемость**: Поддержка множественных подключений
5. **Мониторинг**: Полный контроль над системой

## 📞 Техническая поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs scales-cloud`
2. Проверьте статус: `pm2 status`
3. Проверьте подключение: `curl https://your-server/cloud/status`
4. Проверьте сетевую доступность: `ping your-server`

---

**Результат**: Водители могут взвешиваться в любое время и в любом месте с доступом к мобильному интернету! 🚛📱
