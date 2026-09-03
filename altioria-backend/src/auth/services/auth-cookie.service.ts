import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

import { ADMIN_SESSION_COOKIE_NAME } from '../constants/auth.constants';

import { AuthConfigService } from './auth-config.service';

@Injectable()
export class AuthCookieService {
  constructor(
    private readonly authConfig: AuthConfigService,
  ) {}

  setSessionCookie(
    response: Response,
    sessionToken: string,
    expiresAt: Date,
  ): void {
    response.cookie(
      ADMIN_SESSION_COOKIE_NAME,
      sessionToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api',
        expires: expiresAt,
      },
    );
  }

  clearSessionCookie(response: Response): void {
    response.clearCookie(
      ADMIN_SESSION_COOKIE_NAME,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api',
      },
    );
  }
}