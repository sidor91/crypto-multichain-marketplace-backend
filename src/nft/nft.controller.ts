import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/@common/decorators';
import { GetUserInfoDTO } from 'src/@common/dto/get-user-info.dto';

import { GetUserNFTsResponse } from './dto/get-user-nfts.dto';
import { NftService } from './nft.service';

@ApiTags('NFT API')
@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get('user')
  @ApiOperation({
    summary: 'Get all nfts owned by the user wallet',
  })
  @ApiResponse({
    status: 200,
    type: GetUserNFTsResponse,
  })
  @Public()
  async getUserWalletNFTs(@Query() dto: GetUserInfoDTO) {
    return this.nftService.getUserNFTs(dto);
  }
}
