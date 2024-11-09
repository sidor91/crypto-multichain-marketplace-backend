import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['refreshToken'];

    if (!token) {
      throw new ForbiddenException('Access denied');
    }

    return super.canActivate(context);
  }
}
