import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ description: 'Liveness probe' })
  getHealth() {
    return {
      status: 'ok',
      service: 'kathapp-api',
      timestamp: new Date().toISOString(),
    };
  }
}
