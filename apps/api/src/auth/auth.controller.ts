import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthSession, AuthUser, DevLoginRequest } from '@kathapp/shared';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('v1-auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('dev-login')
  // Mints a token for any email, so it gets a much tighter limit than the
  // blanket one in AppModule.
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOkResponse({ description: 'Dev JWT session (when AUTH_DEV_LOGIN enabled)' })
  async devLogin(@Body() body: DevLoginRequest): Promise<AuthSession> {
    return this.auth.devLogin(body ?? { email: '' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Current authenticated user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  async me(@CurrentUser() user: AuthUser): Promise<AuthUser> {
    return this.auth.me(user);
  }
}
