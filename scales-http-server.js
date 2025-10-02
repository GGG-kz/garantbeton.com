// HTTP сервер для удаленного доступа к весам
const express = require('express');
const cors = require('cors');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

// Настройки COM-порта для весов
const COM_PORT = 'COM3';
const BAUD_RATE = 9600;
const HTTP_PORT = 8080;

let scalesPort = null;
let currentWeight = null;
let lastWeightUpdate = null;
let isConnected = false;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Функция подключения к весам
function connectToScales() {
  try {
    scalesPort = new SerialPort(COM_PORT, {
      baudRate: BAUD_RATE,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });

    const parser = scalesPort.pipe(new Readline({ delimiter: '\r\n' }));

    scalesPort.on('open', () => {
      isConnected = true;
      console.log(`✅ Подключено к весам на ${COM_PORT}`);
      
      // Отправляем команду запроса веса
      requestWeight();
    });

    parser.on('data', (data) => {
      console.log(`📊 Данные с весов: ${data}`);
      
      // Парсим вес из данных (формат зависит от модели весов)
      const weightMatch = data.match(/(\d+\.?\d*)/);
      if (weightMatch) {
        currentWeight = parseFloat(weightMatch[1]);
        lastWeightUpdate = new Date();
        console.log(`⚖️ Текущий вес: ${currentWeight} кг`);
      }
    });

    scalesPort.on('error', (err) => {
      console.error('❌ Ошибка весов:', err.message);
      isConnected = false;
    });

    scalesPort.on('close', () => {
      console.log('🔌 Подключение к весам закрыто');
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ Ошибка подключения к весам:', error.message);
    isConnected = false;
  }
}

// Функция запроса веса с весов
function requestWeight() {
  if (scalesPort && scalesPort.isOpen) {
    // Отправляем команду запроса веса (зависит от модели весов)
    scalesPort.write('W\r\n'); // Обычная команда для получения веса
  }
}

// API маршруты

// Статус сервера
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    scales_connected: isConnected,
    port: COM_PORT,
    current_weight: currentWeight,
    last_update: lastWeightUpdate,
    timestamp: new Date().toISOString()
  });
});

// Получить текущий вес
app.get('/weight', (req, res) => {
  if (!isConnected) {
    return res.status(503).json({
      error: 'Весы не подключены',
      scales_connected: false
    });
  }

  // Запрашиваем новый вес
  requestWeight();
  
  // Ждем немного для получения ответа
  setTimeout(() => {
    res.json({
      value: currentWeight,
      unit: 'kg',
      timestamp: lastWeightUpdate,
      scales_connected: true
    });
  }, 500);
});

// Обнуление весов (тара)
app.post('/tare', (req, res) => {
  if (!isConnected) {
    return res.status(503).json({
      error: 'Весы не подключены',
      scales_connected: false
    });
  }

  if (scalesPort && scalesPort.isOpen) {
    // Отправляем команду обнуления (зависит от модели весов)
    scalesPort.write('T\r\n');
    
    res.json({
      message: 'Команда обнуления отправлена',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      error: 'Ошибка отправки команды',
      scales_connected: false
    });
  }
});

// Принудительное обновление веса
app.post('/refresh', (req, res) => {
  if (!isConnected) {
    return res.status(503).json({
      error: 'Весы не подключены',
      scales_connected: false
    });
  }

  requestWeight();
  
  res.json({
    message: 'Команда обновления веса отправлена',
    timestamp: new Date().toISOString()
  });
});

// Информация о сервере
app.get('/info', (req, res) => {
  res.json({
    name: 'Сервер весов',
    version: '1.0.0',
    port: COM_PORT,
    baud_rate: BAUD_RATE,
    scales_connected: isConnected,
    current_weight: currentWeight,
    last_update: lastWeightUpdate,
    timestamp: new Date().toISOString()
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка сервера:', err);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: err.message
  });
});

// Запускаем сервер
app.listen(HTTP_PORT, () => {
  console.log(`🚀 HTTP сервер весов запущен на порту ${HTTP_PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${HTTP_PORT}`);
  console.log(`🌐 Клиенты могут подключаться по адресу: http://${getLocalIP()}:${HTTP_PORT}`);
  console.log(`⚖️ Подключаемся к весам на ${COM_PORT}...`);
  
  // Подключаемся к весам
  connectToScales();
});

// Функция получения локального IP
function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Обработка завершения работы
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...');
  
  if (scalesPort && scalesPort.isOpen) {
    scalesPort.close();
  }
  
  console.log('✅ Сервер остановлен');
  process.exit(0);
});

console.log('⚖️ HTTP сервер удаленного доступа к весам');
console.log('📋 Инструкции:');
console.log('1. Установите Node.js');
console.log('2. Установите зависимости: npm install express cors serialport @serialport/parser-readline');
console.log('3. Запустите сервер: node scales-http-server.js');
console.log('4. Подключите весы к COM3 порту');
console.log('5. Другие компьютеры смогут подключаться по HTTP');
console.log('');
console.log('📚 API маршруты:');
console.log('GET  /status  - статус сервера и весов');
console.log('GET  /weight  - получить текущий вес');
console.log('POST /tare    - обнулить весы');
console.log('POST /refresh - принудительно обновить вес');
console.log('GET  /info    - информация о сервере');
