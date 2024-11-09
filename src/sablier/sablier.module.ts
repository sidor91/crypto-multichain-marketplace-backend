import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MultiChainModule } from 'src/multichain/multichain.module';
import { Web3Module } from 'src/web3/web3.module';

import { SablierContract } from './entities/sablierContracts.entity';
import { StartBlockSablier } from './entities/sablierStartBlock.entity';
import { SablierService } from './sablier.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StartBlockSablier, SablierContract]),
    Web3Module,
    HttpModule,
    MultiChainModule,
  ],
  providers: [SablierService],
  exports: [SablierService],
})
export class SablierModule {}
