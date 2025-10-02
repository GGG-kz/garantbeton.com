import { Module } from '@nestjs/common';
import { DirectoriesController } from './directories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DirectoriesController],
})
export class DirectoriesModule {}
