import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { EntityDetailResponse } from '@kathapp/shared';
import { EntitiesService } from './entities.service';

@ApiTags('v1-saints')
@Controller('v1/saints')
export class SaintsController {
  constructor(private readonly entities: EntitiesService) {}

  @Get(':id')
  @ApiQuery({ name: 'locale', required: false, description: 'Content locale' })
  @ApiOkResponse({ description: 'Published saint detail' })
  @ApiNotFoundResponse({ description: 'Not found, draft, or soft-deleted' })
  getOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<EntityDetailResponse> {
    return this.entities.getDetail('saint', id, locale);
  }
}
