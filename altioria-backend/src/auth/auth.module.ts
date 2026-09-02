import { Module } from '@nestjs/common';

import { AuthConfigService } from './services/auth-config.service';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './services/auth-cookie.service';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthConfigService,
    AuthCookieService,
  ],
})
export class AuthModule {}