import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ADMIN_SESSION_COOKIE_NAME } from '../constants/auth.constants';
import { RequestWithAdmin } from '../interfaces/authenticated-admin.interface';
import { hashSessionToken } from '../utils/hash-session-token';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithAdmin>();

    const sessionToken = request.cookies?.[
      ADMIN_SESSION_COOKIE_NAME
    ] as unknown;

    if (typeof sessionToken !== 'string' || !sessionToken) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    const tokenHash = hashSessionToken(sessionToken);

    const session = await this.prisma.adminSession.findUnique({
      where: {
        tokenHash,
      },
      select: {
        expiresAt: true,
        admin: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException(
        'Сессия недействительна или истекла',
      );
    }

    request.admin = session.admin;

    return true;
  }
}