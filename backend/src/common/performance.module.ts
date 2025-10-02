import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
import { PerformanceMiddleware } from './compression.middleware';

@Global()
@Module({
  providers: [
    CacheService,
    DatabaseService,
    // CompressionMiddleware, // Временно отключен из-за проблем с импортом
    PerformanceMiddleware,
  ],
  exports: [
    CacheService,
    DatabaseService,
  ],
})
export class PerformanceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Применяем middleware в правильном порядке
    consumer
      .apply(
        PerformanceMiddleware,
        // CompressionMiddleware, // Временно отключен из-за проблем с импортом
      )
      .forRoutes('*');
  }
}