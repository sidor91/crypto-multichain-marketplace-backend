import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StartBlock } from './entities/start_block.entity';
import { StartBlockService } from './start_block.service';

@Module({
  imports: [TypeOrmModule.forFeature([StartBlock])],
  providers: [StartBlockService],
  exports: [StartBlockService],
})
export class StartBlockModule {}
