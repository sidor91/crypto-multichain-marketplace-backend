import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MoralisModule } from 'src/moralis/moralis.module';
import { MultiChainModule } from 'src/multichain/multichain.module';
import { NftModule } from 'src/nft/nft.module';
import { SablierModule } from 'src/sablier/sablier.module';
import { VestingContractModule } from 'src/vesting_contract/vesting_contract.module';
import { Web3Module } from 'src/web3/web3.module';

import { Vesting } from './entities/vesting.entity';
import { VestingController } from './vesting.controller';
import { VestingService } from './vesting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vesting]),
    forwardRef(() => NftModule),
    VestingContractModule,
    Web3Module,
    MoralisModule,
    SablierModule,
    HttpModule,
    MultiChainModule,
  ],
  controllers: [VestingController],
  providers: [VestingService],
  exports: [VestingService],
})
export class VestingModule {}
