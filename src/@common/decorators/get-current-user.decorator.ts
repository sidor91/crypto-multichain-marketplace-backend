import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayloadWithAt } from '../../@types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithAt | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
