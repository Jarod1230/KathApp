import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { V1Module } from './v1/v1.module';

@Module({
  imports: [PrismaModule, V1Module],
  controllers: [HealthController],
})
export class AppModule {}
