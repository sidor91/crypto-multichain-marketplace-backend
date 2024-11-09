import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MoralisService } from './moralis.service';

@Module({
  imports: [CacheModule.register(), ConfigModule],
  providers: [MoralisService],
  exports: [MoralisService],
})
export class MoralisModule {}
