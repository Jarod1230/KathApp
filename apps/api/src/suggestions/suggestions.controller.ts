import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  AuthUser,
  SuggestionCreateRequest,
  SuggestionRejectRequest,
  SuggestionView,
} from '@kathapp/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SuggestionsService } from './suggestions.service';

@ApiTags('v1-suggestions')
@ApiBearerAuth()
@Controller('v1/suggestions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuggestionsController {
  constructor(private readonly suggestions: SuggestionsService) {}

  @Post()
  @Roles('contributor')
  @ApiOkResponse({ description: 'Create suggestion (status=submitted)' })
  @ApiUnauthorizedResponse()
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: SuggestionCreateRequest,
  ): Promise<SuggestionView> {
    return this.suggestions.create(user, body);
  }

  @Get()
  @Roles('reviewer')
  @ApiOkResponse({ description: 'List suggestions (reviewer+)' })
  list(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: string,
  ): Promise<SuggestionView[]> {
    return this.suggestions.list(user, status);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get suggestion (owner or reviewer+)' })
  getOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<SuggestionView> {
    return this.suggestions.getOne(user, id);
  }

  @Post(':id/accept')
  @Roles('reviewer')
  @ApiOkResponse({ description: 'Accept suggestion (publish-gates apply)' })
  accept(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<SuggestionView> {
    return this.suggestions.accept(user, id);
  }

  @Post(':id/reject')
  @Roles('reviewer')
  @ApiOkResponse({ description: 'Reject suggestion' })
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body?: SuggestionRejectRequest,
  ): Promise<SuggestionView> {
    return this.suggestions.reject(user, id, body);
  }
}
