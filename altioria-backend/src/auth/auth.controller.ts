import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Get,
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

import { AdminSessionGuard } from './guards/admin-session.guard';
import { CurrentAdmin } from './decorators/current-admin.decorator';

import { AuthService } from './auth.service';
import { AuthCookieService } from './services/auth-cookie.service';

import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

import { MeResponseDto } from './dto/me-response.dto';
import type { AuthenticatedAdmin } from './interfaces/authenticated-admin.interface';

import { SessionToken } from './decorators/session-token.decorator';

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

  @Get('me')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Получить текущего администратора',
  })
  getMe(
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ): MeResponseDto {
    return {
      admin,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Выход из аккаунта администратора',
  })
  async logout(
    @SessionToken() sessionToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(sessionToken);
  
    this.authCookieService.clearSessionCookie(response);
  }
}