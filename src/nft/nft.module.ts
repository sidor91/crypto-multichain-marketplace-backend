import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoinMarketCapModule } from 'src/coinmarketcap/coinmarketcap.module';
import { MoralisModule } from 'src/moralis/moralis.module';
import { SablierModule } from 'src/sablier/sablier.module';
import { FilterSortModule } from 'src/sortingAndFiltering/filter-sort.module';
import { VestingModule } from 'src/vesting/vesting.module';
import { VestingContractModule } from 'src/vesting_contract/vesting_contract.module';
import { Web3Module } from 'src/web3/web3.module';

import { Nft } from './entities/nft.entity';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nft]),
    MoralisModule,
    Web3Module,
    FilterSortModule,
    CoinMarketCapModule,
    SablierModule,
    forwardRef(() => VestingModule),
    VestingContractModule,
  ],
  controllers: [NftController],
  providers: [NftService],
  exports: [NftService],
})
export class NftModule {}
