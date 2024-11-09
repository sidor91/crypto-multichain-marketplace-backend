import { Repository } from 'typeorm';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Mutex } from 'async-mutex';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { generateRandomString } from 'src/utils';

import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private refreshMutex = new Mutex();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
    private jwtService: JwtService,
  ) {}

  async create(dto: CreateUserDto) {
    return await this.userRepository.save(dto);
  }

  async findAll(request = {}) {
    return await this.userRepository.find({ where: request });
  }

  async findOne(request = {}) {
    return await this.userRepository.findOne({
      where: request,
    });
  }

  async findOrCreate(address: string) {
    let user = await this.findOne({
      address,
    });
    if (!user) {
      user = await this.create({
        address,
      });
    }
    return user;
  }

  async authUser({ address }: AuthUserDto, response: Response) {
    const user = await this.findOrCreate(address);
    return this.getToken(user.id, address, response);
  }

  private async getToken(id: string, address: string, response: Response) {
    const payload = { id, address };

    const refreshTokenUniqueKey = generateRandomString(32);
    const tokens = await this.getTokens(
      payload.id,
      payload.address,
      refreshTokenUniqueKey,
    );
    await this.updateRefreshToken(payload.id, refreshTokenUniqueKey);

    this.setCookies(response, tokens.refreshToken);

    return { success: true, tokens };
  }

  async hashData(password: string) {
    return bcrypt.hash(password, 10);
  }

  async getTokens(userId: string, address: string, key: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          address,
        },
        {
          expiresIn: 60 * 15,
          secret: this.config.get<string>('AT_SECRET'),
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          address,
          key,
        },
        {
          expiresIn: 60 * 60 * 24 * 7,
          secret: this.config.get<string>('RT_SECRET'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string, response: Response) {
    try {
      await this.userRepository.update(userId, {
        refreshToken: null,
      });
      response.clearCookie('refreshToken', {
        expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return true;
    } catch (error) {
      throw new BadRequestException(`logout error: ${error.message}`);
    }
  }

  async refreshTokens(userId: string, key: string, response: Response) {
    const release = await this.refreshMutex.acquire();

    try {
      const user = await this.findOne({ id: userId });
      if (!user || !user.refreshToken) {
        throw new ForbiddenException('Access denied');
      }

      const isMatch = await bcrypt.compare(key, user.refreshToken);
      if (!isMatch) {
        throw new ForbiddenException('Invalid refresh token 1');
      }

      const refreshTokenUniqueKey = generateRandomString(32);
      const tokens = await this.getTokens(
        user.id,
        user.address,
        refreshTokenUniqueKey,
      );

      await this.updateRefreshToken(user.id, refreshTokenUniqueKey);

      this.setCookies(response, tokens.refreshToken);

      return { success: true, tokens };
    } catch (error) {
      throw error;
    } finally {
      release();
    }
  }

  async updateRefreshToken(userId: string, refreshTokenKey: string) {
    const hash = await this.hashData(refreshTokenKey);

    await this.userRepository.update(
      { id: userId },
      {
        refreshToken: hash,
      },
    );
  }

  setCookies(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
  }
}
