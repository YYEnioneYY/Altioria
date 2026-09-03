import { Module } from '@nestjs/common';

import { AuthConfigService } from './services/auth-config.service';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './services/auth-cookie.service';
import { AuthService } from './auth.service';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { SessionCleanupJob } from './jobs/session-cleanup.job';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthConfigService,
    AuthCookieService,
    AdminSessionGuard,
    SessionCleanupJob,
  ],
  exports: [AdminSessionGuard],
})
export class AuthModule {}