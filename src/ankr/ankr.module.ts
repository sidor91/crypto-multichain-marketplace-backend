import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { MultiChainModule } from 'src/multichain/multichain.module';

import { AnkrService } from './ankr.service';

@Module({
  imports: [MultiChainModule, HttpModule, CacheModule.register()],
  providers: [AnkrService],
  exports: [AnkrService],
})
export class AnkrModule {}
