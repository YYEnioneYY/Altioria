import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  Throttle,
  ThrottlerGuard,
} from '@nestjs/throttler';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { AuthCookieService } from './services/auth-cookie.service';

import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Admin auth')
@Controller('admin/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
      blockDuration: 300_000,
    },
  })
  @ApiOperation({
    summary: 'Вход администратора',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginDto);

    this.authCookieService.setSessionCookie(
      response,
      result.sessionToken,
      result.expiresAt,
    );

    return {
      admin: result.admin,
      expiresAt: result.expiresAt,
    };
  }
}