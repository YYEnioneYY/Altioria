import { Module } from '@nestjs/common';

import { AuthConfigService } from './services/auth-config.service';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './services/auth-cookie.service';
import { AuthService } from './auth.service';
import { AdminSessionGuard } from './guards/admin-session.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthConfigService,
    AuthCookieService,
  ],
  exports: [AdminSessionGuard],
})
export class AuthModule {}