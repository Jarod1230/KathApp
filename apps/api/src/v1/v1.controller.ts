import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { API_VERSION_PREFIX } from '@kathapp/shared';

@ApiTags('v1')
@Controller('v1')
export class V1Controller {
  @Get()
  @ApiOkResponse({ description: 'Contract-v1 API root stub' })
  getRoot() {
    return {
      contract: 'v1',
      prefix: API_VERSION_PREFIX,
      entities: [
        'saint',
        'miracle',
        'source',
        'citation',
        'edge',
        'translation',
        'suggestion',
      ],
      note: 'Scaffold stub — no domain seed data.',
    };
  }
}
