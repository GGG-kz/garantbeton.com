import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Устанавливаем глобальный префикс для всех маршрутов, исключая health
  app.setGlobalPrefix('api', {
    exclude: ['health']
  });

  // Включаем CORS для фронтенда
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:5173',
      'https://garantbeton-frontend.onrender.com',
      'https://garantbeton-com.onrender.com'
    ],
    credentials: true,
  });

  // Включаем валидацию
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Настраиваем Swagger
  const config = new DocumentBuilder()
    .setTitle('Бетонный завод API')
    .setDescription('API для автоматизации бетонного завода')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 Backend запущен на http://localhost:${port}`);
  console.log(`📚 Swagger документация: http://localhost:${port}/api/docs`);
}

bootstrap();
