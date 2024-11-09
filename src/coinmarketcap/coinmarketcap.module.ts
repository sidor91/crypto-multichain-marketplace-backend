import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { MultiChainModule } from 'src/multichain/multichain.module';

import { CoinMarketCapController } from './coinmarketcap.controller';
import { CoinMarketCapService } from './coinmarketcap.service';

@Module({
  controllers: [CoinMarketCapController],
  imports: [HttpModule, CacheModule.register(), MultiChainModule],
  providers: [CoinMarketCapService],
  exports: [CoinMarketCapService],
})
export class CoinMarketCapModule {}
