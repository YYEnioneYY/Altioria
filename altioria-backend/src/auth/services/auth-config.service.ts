import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthConfigService {
  readonly sessionTtlMs: number;

  constructor() {
    this.sessionTtlMs = this.parseSessionTtl(
      process.env.ADMIN_SESSION_TTL_HOURS,
    );
  }

  private parseSessionTtl(value: string | undefined): number {
    const hours = Number(value ?? '24');

    if (
      !Number.isInteger(hours) ||
      hours < 1 ||
      hours > 168
    ) {
      throw new Error(
        'ADMIN_SESSION_TTL_HOURS must be an integer from 1 to 168',
      );
    }

    return hours * 60 * 60 * 1000;
  }
}