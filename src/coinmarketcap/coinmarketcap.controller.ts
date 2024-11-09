import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/@common/decorators';

import { CoinMarketCapService } from './coinmarketcap.service';
import { GetBnbRateResponseDTO } from './dto/get-rate.dto';

@ApiTags('Coinmarketcap API')
@Controller('coinmarketcap')
export class CoinMarketCapController {
  constructor(private readonly coinMarketCapService: CoinMarketCapService) {}

  @Get('rate')
  @ApiOperation({
    summary: 'Get the exchange rate of the native token to USDT',
  })
  @ApiResponse({
    status: 200,
    type: GetBnbRateResponseDTO,
  })
  @Public()
  async getBnbRate(@Query('chainId') chainId: string) {
    return this.coinMarketCapService.getRate(chainId);
  }
}
