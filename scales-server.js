// Сервер для удаленного доступа к весам через TCP/IP
const net = require('net');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

// Настройки COM-порта для весов
const COM_PORT = 'COM3';
const BAUD_RATE = 9600;
const TCP_PORT = 8080;

let scalesPort = null;
let connectedClients = new Set();

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
      console.log(`✅ Подключено к весам на ${COM_PORT}`);
      
      // Отправляем команду запроса веса (зависит от модели весов)
      scalesPort.write('W\r\n'); // Обычная команда для получения веса
    });

    parser.on('data', (data) => {
      console.log(`📊 Данные с весов: ${data}`);
      
      // Парсим вес из данных (формат зависит от модели весов)
      const weightMatch = data.match(/(\d+\.?\d*)/);
      if (weightMatch) {
        const weight = parseFloat(weightMatch[1]);
        
        // Отправляем вес всем подключенным клиентам
        const message = JSON.stringify({
          type: 'weight',
          value: weight,
          unit: 'kg',
          timestamp: new Date().toISOString()
        });
        
        connectedClients.forEach(client => {
          if (client.writable) {
            client.write(message + '\n');
          }
        });
      }
    });

    scalesPort.on('error', (err) => {
      console.error('❌ Ошибка весов:', err.message);
    });

  } catch (error) {
    console.error('❌ Ошибка подключения к весам:', error.message);
  }
}

// Создаем TCP сервер
const server = net.createServer((client) => {
  console.log(`🔗 Новый клиент подключился: ${client.remoteAddress}:${client.remotePort}`);
  connectedClients.add(client);

  // Отправляем приветственное сообщение
  client.write(JSON.stringify({
    type: 'connected',
    message: 'Подключено к серверу весов',
    port: COM_PORT,
    timestamp: new Date().toISOString()
  }) + '\n');

  // Обработка данных от клиента
  client.on('data', (data) => {
    try {
      const command = JSON.parse(data.toString().trim());
      
      switch (command.type) {
        case 'get_weight':
          // Запрашиваем вес с весов
          if (scalesPort && scalesPort.isOpen) {
            scalesPort.write('W\r\n');
          } else {
            client.write(JSON.stringify({
              type: 'error',
              message: 'Весы не подключены'
            }) + '\n');
          }
          break;
          
        case 'tare':
          // Обнуление весов
          if (scalesPort && scalesPort.isOpen) {
            scalesPort.write('T\r\n');
            client.write(JSON.stringify({
              type: 'tare',
              message: 'Команда обнуления отправлена'
            }) + '\n');
          }
          break;
          
        default:
          client.write(JSON.stringify({
            type: 'error',
            message: 'Неизвестная команда'
          }) + '\n');
      }
    } catch (error) {
      client.write(JSON.stringify({
        type: 'error',
        message: 'Ошибка парсинга команды'
      }) + '\n');
    }
  });

  client.on('end', () => {
    console.log(`🔌 Клиент отключился: ${client.remoteAddress}:${client.remotePort}`);
    connectedClients.delete(client);
  });

  client.on('error', (error) => {
    console.error(`❌ Ошибка клиента: ${error.message}`);
    connectedClients.delete(client);
  });
});

// Запускаем сервер
server.listen(TCP_PORT, () => {
  console.log(`🚀 TCP сервер весов запущен на порту ${TCP_PORT}`);
  console.log(`📡 Клиенты могут подключаться по адресу: ${getLocalIP()}:${TCP_PORT}`);
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
  
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

console.log('⚖️ Сервер удаленного доступа к весам');
console.log('📋 Инструкции:');
console.log('1. Установите Node.js');
console.log('2. Установите зависимости: npm install serialport @serialport/parser-readline');
console.log('3. Запустите сервер: node scales-server.js');
console.log('4. Подключите весы к COM3 порту');
console.log('5. Другие компьютеры смогут подключаться по TCP');
