import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

import { ADMIN_SESSION_COOKIE_NAME } from '../constants/auth.constants';

export const SessionToken = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): string | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const sessionToken = request.cookies?.[
      ADMIN_SESSION_COOKIE_NAME
    ] as unknown;

    return typeof sessionToken === 'string'
      ? sessionToken
      : undefined;
  },
);