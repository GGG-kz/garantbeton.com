"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api', {
        exclude: ['health']
    });
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://garantbeton-frontend.onrender.com',
            'https://garantbeton-com.onrender.com'
        ],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Бетонный завод API')
        .setDescription('API для автоматизации бетонного завода')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`🚀 Backend запущен на http://localhost:${port}`);
    console.log(`📚 Swagger документация: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map