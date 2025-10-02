import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
import { CompressionMiddleware, PerformanceMiddleware } from './compression.middleware';

@Global()
@Module({
  providers: [
    CacheService,
    DatabaseService,
    CompressionMiddleware,
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
        CompressionMiddleware,
      )
      .forRoutes('*');
  }
}