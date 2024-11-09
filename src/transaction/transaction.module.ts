import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoinMarketCapModule } from 'src/coinmarketcap/coinmarketcap.module';
import { MultiChainModule } from 'src/multichain/multichain.module';
import { OrderModule } from 'src/order/order.module';
import { FilterSortModule } from 'src/sortingAndFiltering/filter-sort.module';
import { UserModule } from 'src/user/user.module';
import { VestingModule } from 'src/vesting/vesting.module';

import { Transaction } from './entities/transaction.entity';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    OrderModule,
    UserModule,
    FilterSortModule,
    CoinMarketCapModule,
    VestingModule,
    MultiChainModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
