import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MultiChainModule } from 'src/multichain/multichain.module';
import { Web3Module } from 'src/web3/web3.module';

import { VestingContract } from './entities/vesting_contract.entity';
import { VestingContractController } from './vesting_contract.controller';
import { VestingContractService } from './vesting_contract.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VestingContract]),
    Web3Module,
    MultiChainModule,
  ],
  controllers: [VestingContractController],
  providers: [VestingContractService],
  exports: [VestingContractService],
})
export class VestingContractModule {}
