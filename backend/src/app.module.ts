import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { PerformanceModule } from './common/performance.module';
import { PerformanceController } from './common/performance.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PerformanceModule, // Добавляем модуль производительности первым
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [PerformanceController],
})
export class AppModule {}
