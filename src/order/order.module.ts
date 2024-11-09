import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoinMarketCapModule } from 'src/coinmarketcap/coinmarketcap.module';
import { MoralisModule } from 'src/moralis/moralis.module';
import { MultiChainModule } from 'src/multichain/multichain.module';
import { NftModule } from 'src/nft/nft.module';
import { SablierModule } from 'src/sablier/sablier.module';
import { FilterSortModule } from 'src/sortingAndFiltering/filter-sort.module';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/user/user.module';
import { VestingModule } from 'src/vesting/vesting.module';
import { Web3Module } from 'src/web3/web3.module';

import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UserModule,
    NftModule,
    TokenModule,
    MoralisModule,
    FilterSortModule,
    CoinMarketCapModule,
    VestingModule,
    Web3Module,
    SablierModule,
    MultiChainModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
