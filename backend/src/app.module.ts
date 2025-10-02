import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { PerformanceModule } from './common/performance.module';
import { PerformanceController } from './common/performance.controller';
import { RequestsModule } from './requests/requests.module';
import { DirectoriesModule } from './directories/directories.module';

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
    RequestsModule,
    DirectoriesModule,
  ],
  controllers: [PerformanceController],
})
export class AppModule {}
