import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { V1Module } from './v1/v1.module';

@Module({
  imports: [
    // A blanket per-IP limit. /v1/auth/dev-login mints tokens, so it carries a
    // tighter limit of its own on the controller.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    SuggestionsModule,
    V1Module,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
