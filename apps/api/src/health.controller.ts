import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness only: is this process running. It deliberately does not touch the
   * database — a Postgres outage would otherwise make an orchestrator restart
   * an API that is perfectly healthy and would recover on its own.
   */
  @Get()
  @ApiOkResponse({ description: 'Liveness probe. Does not check dependencies.' })
  async getHealth(): Promise<{
    status: 'ok';
    service: string;
    timestamp: string;
  }> {
    return {
      status: 'ok',
      service: 'kathapp-api',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness: can this process actually serve requests. Every public route
   * reads from Postgres, so an API that cannot reach it is not ready, and
   * saying "ok" there would be a lie a load balancer acts on.
   */
  @Get('ready')
  @ApiOkResponse({ description: 'Ready: dependencies reachable' })
  @ApiServiceUnavailableResponse({ description: 'A dependency is unreachable' })
  async getReadiness(): Promise<{
    status: 'ready';
    database: 'up';
    timestamp: string;
  }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        database: 'down',
        timestamp: new Date().toISOString(),
      });
    }
    return {
      status: 'ready',
      database: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
