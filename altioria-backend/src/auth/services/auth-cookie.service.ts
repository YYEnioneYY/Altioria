import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

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
      this.authConfig.sessionCookieName,
      sessionToken,
      {
        httpOnly: true,
        secure: this.authConfig.isProduction,
        sameSite: 'strict',
        path: this.authConfig.sessionCookiePath,
        expires: expiresAt,
      },
    );
  }

  clearSessionCookie(response: Response): void {
    response.clearCookie(
      this.authConfig.sessionCookieName,
      {
        httpOnly: true,
        secure: this.authConfig.isProduction,
        sameSite: 'strict',
        path: this.authConfig.sessionCookiePath,
      },
    );
  }
}