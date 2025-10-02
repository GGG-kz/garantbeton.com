export interface ScalesModel {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'odd' | 'even';
  commands: ScalesCommands;
  autoSettings: AutoSettings;
}

export interface ScalesCommands {
  getWeight: string;           // Команда для получения веса
  tare: string;               // Команда для тарирования
  zero: string;               // Команда для обнуления
  calibration: string;        // Команда для калибровки
  status: string;             // Команда для проверки статуса
  reset: string;              // Команда для сброса
}

export interface AutoSettings {
  autoConnect: boolean;       // Автоматическое подключение
  autoTare: boolean;          // Автоматическое тарирование
  autoZero: boolean;          // Автоматическое обнуление
  pollingInterval: number;    // Интервал опроса (мс)
  timeout: number;            // Таймаут ответа (мс)
  retryAttempts: number;      // Количество попыток
  autoReconnect: boolean;     // Автоматическое переподключение
  connectionDelay: number;    // Задержка подключения (мс)
}

export interface ScalesResponse {
  weight: number;
  unit: string;
  status: string;
  timestamp: Date;
  rawData: string;
}

export interface ScalesStatus {
  connected: boolean;
  model: ScalesModel | null;
  currentWeight: number;
  lastUpdate: Date;
  error: string | null;
  port: string | null;
}

// Предустановленные модели весов
export const PRESET_SCALES_MODELS: ScalesModel[] = [
  {
    id: 'cas-cs-200',
    name: 'CAS CS-200',
    manufacturer: 'CAS',
    model: 'CS-200',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    commands: {
      getWeight: 'W\r\n',           // Получить вес
      tare: 'T\r\n',               // Тарирование
      zero: 'Z\r\n',               // Обнуление
      calibration: 'C\r\n',        // Калибровка
      status: 'S\r\n',             // Статус
      reset: 'R\r\n'               // Сброс
    },
    autoSettings: {
      autoConnect: true,
      autoTare: true,
      autoZero: false,
      pollingInterval: 1000,
      timeout: 3000,
      retryAttempts: 3,
      autoReconnect: true,
      connectionDelay: 1000
    }
  },
  {
    id: 'mettler-toledo-ind780',
    name: 'Mettler Toledo IND780',
    manufacturer: 'Mettler Toledo',
    model: 'IND780',
    baudRate: 19200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    commands: {
      getWeight: 'S\r\n',           // Получить вес
      tare: 'T\r\n',               // Тарирование
      zero: 'Z\r\n',               // Обнуление
      calibration: 'CAL\r\n',      // Калибровка
      status: 'ST\r\n',            // Статус
      reset: 'RESET\r\n'           // Сброс
    },
    autoSettings: {
      autoConnect: true,
      autoTare: true,
      autoZero: true,
      pollingInterval: 500,
      timeout: 2000,
      retryAttempts: 5,
      autoReconnect: true,
      connectionDelay: 500
    }
  },
  {
    id: 'sartorius-ql6201',
    name: 'Sartorius QL6201',
    manufacturer: 'Sartorius',
    model: 'QL6201',
    baudRate: 9600,
    dataBits: 7,
    stopBits: 1,
    parity: 'even',
    commands: {
      getWeight: 'P\r\n',           // Получить вес
      tare: 'T\r\n',               // Тарирование
      zero: 'Z\r\n',               // Обнуление
      calibration: 'CAL\r\n',      // Калибровка
      status: 'STAT\r\n',          // Статус
      reset: 'RESET\r\n'           // Сброс
    },
    autoSettings: {
      autoConnect: true,
      autoTare: false,
      autoZero: true,
      pollingInterval: 2000,
      timeout: 5000,
      retryAttempts: 2,
      autoReconnect: false,
      connectionDelay: 2000
    }
  },
  {
    id: 'ohaus-adventurer',
    name: 'Ohaus Adventurer',
    manufacturer: 'Ohaus',
    model: 'Adventurer',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    commands: {
      getWeight: 'W\r\n',           // Получить вес
      tare: 'T\r\n',               // Тарирование
      zero: 'Z\r\n',               // Обнуление
      calibration: 'C\r\n',        // Калибровка
      status: 'S\r\n',             // Статус
      reset: 'R\r\n'               // Сброс
    },
    autoSettings: {
      autoConnect: false,
      autoTare: true,
      autoZero: true,
      pollingInterval: 1500,
      timeout: 4000,
      retryAttempts: 3,
      autoReconnect: true,
      connectionDelay: 1500
    }
  },
  {
    id: 'shimadzu-uw620h',
    name: 'Shimadzu UW620H',
    manufacturer: 'Shimadzu',
    model: 'UW620H',
    baudRate: 2400,
    dataBits: 7,
    stopBits: 2,
    parity: 'even',
    commands: {
      getWeight: 'P\r\n',           // Получить вес
      tare: 'T\r\n',               // Тарирование
      zero: 'Z\r\n',               // Обнуление
      calibration: 'CAL\r\n',      // Калибровка
      status: 'STAT\r\n',          // Статус
      reset: 'RESET\r\n'           // Сброс
    },
    autoSettings: {
      autoConnect: true,
      autoTare: false,
      autoZero: false,
      pollingInterval: 3000,
      timeout: 6000,
      retryAttempts: 2,
      autoReconnect: false,
      connectionDelay: 3000
    }
  }
];

