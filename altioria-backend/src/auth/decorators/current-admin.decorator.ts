import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

import {
  AuthenticatedAdmin,
  RequestWithAdmin,
} from '../interfaces/authenticated-admin.interface';

export const CurrentAdmin = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedAdmin => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithAdmin>();

    return request.admin;
  },
);