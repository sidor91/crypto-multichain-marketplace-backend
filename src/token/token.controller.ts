import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/@common/decorators';
import { GetUserInfoDTO } from 'src/@common/dto/get-user-info.dto';
import {
  GetTokenDetailsDto,
  GetTokenDetailsResponseDto,
} from 'src/@common/dto/token-details.dto';

import { GetUserInfoResponse } from './dto/get-user-info.dto';
import { TokenService } from './token.service';

@ApiTags('Token API')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('user')
  @ApiOperation({
    summary: 'Get all tokens owned by the user wallet',
  })
  @ApiResponse({
    status: 200,
    type: GetUserInfoResponse,
  })
  @Public()
  async getUserTokens(@Query() dto: GetUserInfoDTO) {
    return this.tokenService.getAllUserTokens(dto);
  }

  @Get('details')
  @ApiOperation({
    summary: 'Get token details by token address',
  })
  @ApiResponse({
    status: 200,
    type: GetTokenDetailsResponseDto,
  })
  @Public()
  async getTokenDetails(@Query() dto: GetTokenDetailsDto) {
    return this.tokenService.getTokenDetails(dto);
  }
}
