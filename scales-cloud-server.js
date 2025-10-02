// Облачный сервер для удаленного доступа к весам через мобильный интернет
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Настройки
const CLOUD_PORT = process.env.PORT || 3001;
const LOCAL_SCALES_SERVER = process.env.LOCAL_SCALES_URL || 'http://192.168.1.100:8080';

// Middleware
app.use(cors());
app.use(express.json());

// Хранилище данных
let scalesData = {
  connected: false,
  lastWeight: null,
  lastUpdate: null,
  localServerStatus: 'offline'
};

// Функция проверки локального сервера весов
async function checkLocalScalesServer() {
  try {
    const response = await axios.get(`${LOCAL_SCALES_SERVER}/status`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      scalesData.localServerStatus = 'online';
      scalesData.connected = response.data.scales_connected;
      scalesData.lastWeight = response.data.current_weight;
      scalesData.lastUpdate = new Date().toISOString();
      
      // Уведомляем всех подключенных клиентов
      broadcastToClients({
        type: 'scales_status',
        data: scalesData
      });
      
      return true;
    }
  } catch (error) {
    scalesData.localServerStatus = 'offline';
    scalesData.connected = false;
    
    // Уведомляем всех подключенных клиентов
    broadcastToClients({
      type: 'scales_status',
      data: scalesData
    });
  }
  
  return false;
}

// Функция получения веса с локального сервера
async function getWeightFromLocalServer() {
  try {
    const response = await axios.get(`${LOCAL_SCALES_SERVER}/weight`, {
      timeout: 10000
    });
    
    if (response.status === 200) {
      scalesData.lastWeight = response.data.value;
      scalesData.lastUpdate = new Date().toISOString();
      
      // Уведомляем всех подключенных клиентов
      broadcastToClients({
        type: 'weight_update',
        data: {
          weight: response.data.value,
          timestamp: scalesData.lastUpdate
        }
      });
      
      return response.data;
    }
  } catch (error) {
    console.error('Ошибка получения веса:', error.message);
    throw error;
  }
}

// Функция отправки команды на локальный сервер
async function sendCommandToLocalServer(command) {
  try {
    const response = await axios.post(`${LOCAL_SCALES_SERVER}/${command}`, {}, {
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error(`Ошибка выполнения команды ${command}:`, error.message);
    throw error;
  }
}

// WebSocket подключения
const connectedClients = new Set();

wss.on('connection', (ws) => {
  console.log('🔗 Новый клиент подключился через WebSocket');
  connectedClients.add(ws);
  
  // Отправляем текущий статус
  ws.send(JSON.stringify({
    type: 'scales_status',
    data: scalesData
  }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'get_weight':
          try {
            const weightData = await getWeightFromLocalServer();
            ws.send(JSON.stringify({
              type: 'weight_response',
              data: weightData
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Ошибка получения веса с локального сервера'
            }));
          }
          break;
          
        case 'tare':
          try {
            const result = await sendCommandToLocalServer('tare');
            ws.send(JSON.stringify({
              type: 'tare_response',
              data: result
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Ошибка обнуления весов'
            }));
          }
          break;
          
        case 'refresh':
          try {
            const result = await sendCommandToLocalServer('refresh');
            ws.send(JSON.stringify({
              type: 'refresh_response',
              data: result
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Ошибка обновления весов'
            }));
          }
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Ошибка обработки сообщения'
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Клиент отключился от WebSocket');
    connectedClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ Ошибка WebSocket:', error.message);
    connectedClients.delete(ws);
  });
});

// Функция отправки сообщений всем клиентам
function broadcastToClients(message) {
  const messageStr = JSON.stringify(message);
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// API маршруты

// Статус облачного сервера
app.get('/cloud/status', (req, res) => {
  res.json({
    status: 'ok',
    type: 'cloud_server',
    local_server_url: LOCAL_SCALES_SERVER,
    local_server_status: scalesData.localServerStatus,
    scales_connected: scalesData.connected,
    last_weight: scalesData.lastWeight,
    last_update: scalesData.lastUpdate,
    connected_clients: connectedClients.size,
    timestamp: new Date().toISOString()
  });
});

// Получить вес через облако
app.get('/cloud/weight', async (req, res) => {
  try {
    if (scalesData.localServerStatus !== 'online') {
      return res.status(503).json({
        error: 'Локальный сервер весов недоступен',
        local_server_status: scalesData.localServerStatus
      });
    }
    
    const weightData = await getWeightFromLocalServer();
    res.json({
      ...weightData,
      source: 'cloud_server',
      local_server_status: 'online'
    });
  } catch (error) {
    res.status(503).json({
      error: 'Ошибка получения веса через облако',
      message: error.message
    });
  }
});

// Обнуление весов через облако
app.post('/cloud/tare', async (req, res) => {
  try {
    if (scalesData.localServerStatus !== 'online') {
      return res.status(503).json({
        error: 'Локальный сервер весов недоступен',
        local_server_status: scalesData.localServerStatus
      });
    }
    
    const result = await sendCommandToLocalServer('tare');
    res.json({
      ...result,
      source: 'cloud_server',
      local_server_status: 'online'
    });
  } catch (error) {
    res.status(503).json({
      error: 'Ошибка обнуления весов через облако',
      message: error.message
    });
  }
});

// Информация о сервере
app.get('/cloud/info', (req, res) => {
  res.json({
    name: 'Облачный сервер весов',
    version: '1.0.0',
    description: 'Промежуточный сервер для доступа к весам через мобильный интернет',
    local_server_url: LOCAL_SCALES_SERVER,
    local_server_status: scalesData.localServerStatus,
    scales_connected: scalesData.connected,
    last_weight: scalesData.lastWeight,
    last_update: scalesData.lastUpdate,
    connected_clients: connectedClients.size,
    features: [
      'WebSocket поддержка для реального времени',
      'HTTP API для мобильных приложений',
      'Автоматическая синхронизация с локальным сервером',
      'Поддержка мобильного интернета'
    ],
    timestamp: new Date().toISOString()
  });
});

// Периодическая проверка локального сервера
setInterval(checkLocalScalesServer, 10000); // Каждые 10 секунд

// Запуск сервера
server.listen(CLOUD_PORT, () => {
  console.log(`🌐 Облачный сервер весов запущен на порту ${CLOUD_PORT}`);
  console.log(`📡 Локальный сервер весов: ${LOCAL_SCALES_SERVER}`);
  console.log(`🔗 WebSocket: ws://localhost:${CLOUD_PORT}`);
  console.log(`📱 HTTP API: http://localhost:${CLOUD_PORT}/cloud/`);
  console.log('');
  console.log('📋 Доступные маршруты:');
  console.log(`GET  /cloud/status - статус облачного сервера`);
  console.log(`GET  /cloud/weight - получить вес через облако`);
  console.log(`POST /cloud/tare   - обнулить весы через облако`);
  console.log(`GET  /cloud/info   - информация о сервере`);
  console.log('');
  console.log('🔄 Автоматическая проверка локального сервера каждые 10 секунд');
  
  // Первоначальная проверка
  checkLocalScalesServer();
});

// Обработка завершения работы
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы облачного сервера...');
  
  // Закрываем все WebSocket подключения
  connectedClients.forEach(client => {
    client.close();
  });
  
  server.close(() => {
    console.log('✅ Облачный сервер остановлен');
    process.exit(0);
  });
});

console.log('☁️ Облачный сервер для удаленного доступа к весам');
console.log('📋 Инструкции:');
console.log('1. Установите Node.js');
console.log('2. Установите зависимости: npm install express cors ws axios');
console.log('3. Настройте переменные окружения:');
console.log('   - LOCAL_SCALES_URL=http://192.168.1.100:8080');
console.log('   - PORT=3001');
console.log('4. Запустите сервер: node scales-cloud-server.js');
console.log('5. Водители могут подключаться через мобильный интернет');
