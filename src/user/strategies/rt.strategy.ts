import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies['refreshToken'];
        },
      ]),
      secretOrKey: config.get<string>('RT_SECRET'),
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: any) {
    try {
      const refreshToken = req.cookies['refreshToken'];

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found in cookies');
      }
      return {
        ...payload,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token 2');
    }
  }
}
