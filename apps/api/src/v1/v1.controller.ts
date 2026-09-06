import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { API_VERSION_PREFIX } from '@kathapp/shared';

@ApiTags('v1')
@Controller('v1')
export class V1Controller {
  @Get()
  @ApiOkResponse({ description: 'Contract-v1 API root' })
  getRoot() {
    return {
      contract: 'v1',
      prefix: API_VERSION_PREFIX,
      endpoints: {
        search: 'GET /v1/search?q=&locale=&type=',
        saints: 'GET /v1/saints/:id?locale=',
        miracles: 'GET /v1/miracles/:id?locale=',
        sources: 'GET /v1/sources/:id?locale=',
      },
      entities: [
        'saint',
        'miracle',
        'source',
        'citation',
        'edge',
        'translation',
        'suggestion',
      ],
      note: 'Public reads return published entities only; empty DB → empty search / 404 detail. No domain seed data.',
    };
  }
}
