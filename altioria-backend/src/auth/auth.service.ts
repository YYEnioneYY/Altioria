import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';

import { AuthConfigService } from './services/auth-config.service';
import { hashSessionToken } from './utils/hash-session-token';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface LoginResult {
  admin: {
    id: string;
    username: string;
    createdAt: Date;
  };
  sessionToken: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authConfig: AuthConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResult> {
    const username = loginDto.username
      .trim()
      .toLowerCase();

    const invalidCredentialsError =
      new UnauthorizedException('Неверное имя пользователя или пароль');

    const admin = await this.prisma.admin.findUnique({
      where: {
        username: loginDto.username,
      },
    });

    if (!admin) {
      throw invalidCredentialsError;
    }

    const passwordMatches = await argon2.verify(
      admin.passwordHash,
      loginDto.password,
    );

    if (!passwordMatches) {
      throw invalidCredentialsError;
    }

    const sessionToken = randomBytes(32).toString(
      'base64url',
    );

    const tokenHash = hashSessionToken(sessionToken);

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.authConfig.sessionTtlMs,
    );

    await this.prisma.$transaction([
      this.prisma.adminSession.deleteMany({
        where: {
          adminId: admin.id,
          expiresAt: {
            lte: now,
          },
        },
      }),

      this.prisma.adminSession.create({
        data: {
          adminId: admin.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    return {
      admin: {
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt,
      },
      sessionToken,
      expiresAt,
    };
  }
}