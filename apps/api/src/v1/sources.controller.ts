import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { EntityDetailResponse } from '@kathapp/shared';
import { EntitiesService } from './entities.service';

@ApiTags('v1-sources')
@Controller('v1/sources')
export class SourcesController {
  constructor(private readonly entities: EntitiesService) {}

  @Get(':id')
  @ApiQuery({ name: 'locale', required: false, description: 'Content locale' })
  @ApiOkResponse({ description: 'Published source detail' })
  @ApiNotFoundResponse({ description: 'Not found, draft, or soft-deleted' })
  getOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<EntityDetailResponse> {
    return this.entities.getDetail('source', id, locale);
  }
}
