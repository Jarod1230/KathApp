import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  AuthSession,
  AuthUser,
  DevLoginRequest,
  Role,
} from '@kathapp/shared';
import { ROLES } from '@kathapp/shared';
import { Role as PrismaRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isDevLoginEnabled } from './auth.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Dev-login is off unless AUTH_DEV_LOGIN is exactly "true" (see auth.config). */
  isDevLoginEnabled(): boolean {
    return isDevLoginEnabled(process.env);
  }

  assertDevLoginEnabled(): void {
    if (this.isDevLoginEnabled()) return;
    // Prefer 404 so production does not advertise the endpoint.
    throw new NotFoundException('Not Found');
  }

  async devLogin(body: DevLoginRequest): Promise<AuthSession> {
    this.assertDevLoginEnabled();

    const email = (body.email ?? '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new ForbiddenException('Valid email required');
    }

    let role: Role = 'contributor';
    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) {
        throw new ForbiddenException('Invalid role');
      }
      role = body.role;
    }

    const user = await this.prisma.user.upsert({
      where: { email },
      create: {
        email,
        role: role as PrismaRole,
      },
      update: {
        role: role as PrismaRole,
        deletedAt: null,
      },
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
    };

    const accessToken = await this.jwt.signAsync({
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role,
    });

    return { accessToken, user: authUser };
  }

  async me(user: AuthUser): Promise<AuthUser> {
    const row = await this.prisma.user.findFirst({
      where: { id: user.id, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundException('User not found');
    }
    return {
      id: row.id,
      email: row.email,
      role: row.role as Role,
    };
  }
}
