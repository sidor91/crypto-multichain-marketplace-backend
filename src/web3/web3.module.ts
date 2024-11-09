import { Module } from '@nestjs/common';

import { MultiChainModule } from 'src/multichain/multichain.module';

import { Web3Service } from './web3.service';

@Module({
  imports: [MultiChainModule],
  providers: [Web3Service],
  exports: [Web3Service],
})
export class Web3Module {}
