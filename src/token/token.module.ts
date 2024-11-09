import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnkrModule } from 'src/ankr/ankr.module';
import { CoinMarketCapModule } from 'src/coinmarketcap/coinmarketcap.module';
import { MoralisModule } from 'src/moralis/moralis.module';
import { MultiChainModule } from 'src/multichain/multichain.module';
import { FilterSortModule } from 'src/sortingAndFiltering/filter-sort.module';
import { Web3Module } from 'src/web3/web3.module';

import { Token } from './entities/token.entity';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    AnkrModule,
    MoralisModule,
    Web3Module,
    FilterSortModule,
    CoinMarketCapModule,
    HttpModule,
    MultiChainModule,
    ConfigModule,
    CacheModule.register(),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
