import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Payload } from '../../@types';

export const GetCurrentUserAddress = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as Payload;
    return user.address;
  },
);
