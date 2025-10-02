import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

interface EnvVar {
  name: string;
  value: string | undefined;
  required: boolean;
  description: string;
}

const requiredEnvVars: EnvVar[] = [
  {
    name: 'DATABASE_URL',
    value: process.env.DATABASE_URL,
    required: true,
    description: 'URL подключения к базе данных PostgreSQL'
  },
  {
    name: 'JWT_SECRET',
    value: process.env.JWT_SECRET,
    required: true,
    description: 'Секретный ключ для JWT токенов'
  },
  {
    name: 'JWT_EXPIRES_IN',
    value: process.env.JWT_EXPIRES_IN,
    required: true,
    description: 'Время жизни JWT токенов'
  },
  {
    name: 'JWT_REFRESH_SECRET',
    value: process.env.JWT_REFRESH_SECRET,
    required: true,
    description: 'Секретный ключ для refresh токенов'
  },
  {
    name: 'JWT_REFRESH_EXPIRES_IN',
    value: process.env.JWT_REFRESH_EXPIRES_IN,
    required: true,
    description: 'Время жизни refresh токенов'
  },
  {
    name: 'PORT',
    value: process.env.PORT,
    required: true,
    description: 'Порт для запуска сервера'
  },
  {
    name: 'NODE_ENV',
    value: process.env.NODE_ENV,
    required: true,
    description: 'Окружение (development/production)'
  },
  {
    name: 'BCRYPT_ROUNDS',
    value: process.env.BCRYPT_ROUNDS,
    required: false,
    description: 'Количество раундов для хеширования паролей'
  },
  {
    name: 'CORS_ORIGIN',
    value: process.env.CORS_ORIGIN,
    required: false,
    description: 'Разрешенные домены для CORS'
  },
  {
    name: 'DB_POOL_SIZE',
    value: process.env.DB_POOL_SIZE,
    required: false,
    description: 'Размер пула соединений с базой данных'
  },
  {
    name: 'DB_CONNECTION_TIMEOUT',
    value: process.env.DB_CONNECTION_TIMEOUT,
    required: false,
    description: 'Таймаут подключения к базе данных'
  },
  {
    name: 'LOG_LEVEL',
    value: process.env.LOG_LEVEL,
    required: false,
    description: 'Уровень логирования'
  }
];

function checkEnvironmentVariables() {
  console.log('🔍 Проверка переменных окружения...\n');
  
  let hasErrors = false;
  
  requiredEnvVars.forEach(envVar => {
    const status = envVar.value ? '✅' : (envVar.required ? '❌' : '⚠️');
    const required = envVar.required ? '(обязательная)' : '(опциональная)';
    
    console.log(`${status} ${envVar.name} ${required}`);
    console.log(`   Описание: ${envVar.description}`);
    
    if (envVar.value) {
      // Скрываем чувствительные данные
      if (envVar.name.includes('SECRET') || envVar.name.includes('URL')) {
        const maskedValue = envVar.value.length > 20 
          ? envVar.value.substring(0, 10) + '...' + envVar.value.substring(envVar.value.length - 10)
          : '***';
        console.log(`   Значение: ${maskedValue}`);
      } else {
        console.log(`   Значение: ${envVar.value}`);
      }
    } else {
      if (envVar.required) {
        hasErrors = true;
        console.log(`   ❌ ОТСУТСТВУЕТ!`);
      } else {
        console.log(`   ⚠️  Не установлена (будет использовано значение по умолчанию)`);
      }
    }
    console.log('');
  });
  
  // Проверка специфичных значений
  console.log('🔧 Проверка значений...\n');
  
  // Проверка NODE_ENV
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    console.log('❌ NODE_ENV должен быть development, production или test');
    hasErrors = true;
  }
  
  // Проверка PORT
  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    console.log('❌ PORT должен быть числом');
    hasErrors = true;
  }
  
  // Проверка BCRYPT_ROUNDS
  if (process.env.BCRYPT_ROUNDS && (isNaN(Number(process.env.BCRYPT_ROUNDS)) || Number(process.env.BCRYPT_ROUNDS) < 10)) {
    console.log('❌ BCRYPT_ROUNDS должен быть числом >= 10');
    hasErrors = true;
  }
  
  // Проверка DATABASE_URL
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log('❌ DATABASE_URL должен начинаться с postgresql://');
    hasErrors = true;
  }
  
  console.log('='.repeat(50));
  
  if (hasErrors) {
    console.log('❌ Обнаружены ошибки в переменных окружения!');
    console.log('📋 Проверьте файл RENDER_ENVIRONMENT_VARIABLES.md для правильной настройки');
    process.exit(1);
  } else {
    console.log('✅ Все переменные окружения настроены правильно!');
    console.log('🚀 Сервер готов к запуску');
  }
}

checkEnvironmentVariables();
