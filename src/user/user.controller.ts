import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from 'src/@common/decorators';
import { AtGuard, RtGuard } from 'src/@common/guards';

import { AuthUserDto, AuthUserResponseDto } from './dto/auth-user.dto';
import { UserService } from './user.service';

@ApiTags('User API')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Auth user
  @Post('/auth')
  @ApiOperation({ summary: 'Auth user' })
  @ApiResponse({
    status: 200,
    type: AuthUserResponseDto,
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  async auth(
    @Body() userDto: AuthUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.userService.authUser(userDto, response);
  }

  // Refresh tokens
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({
    status: 200,
    type: AuthUserResponseDto,
  })
  @UseGuards(RtGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('key') key: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.userService.refreshTokens(userId, key, response);
  }

  // Logout user
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.userService.logout(userId, response);
  }
}
