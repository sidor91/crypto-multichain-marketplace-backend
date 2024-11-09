import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateStartBlockDto } from './dto/create-start-block.dto';
import { StartBlock } from './entities/start_block.entity';

@Injectable()
export class StartBlockService {
  private logger = new Logger(StartBlockService.name);

  constructor(
    @InjectRepository(StartBlock)
    private startBlockRepository: Repository<StartBlock>,
  ) {}

  private async create(dto: CreateStartBlockDto) {
    return await this.startBlockRepository.save(dto);
  }

  async findOne(condition = {}) {
    return await this.startBlockRepository.findOne({
      where: condition,
    });
  }

  async findOrCreate(
    chain_id: string,
    event_name: string,
    block_number: number,
  ) {
    let startBlock = await this.findOne({ chain_id, event_name });
    if (!startBlock) {
      startBlock = await this.create({ chain_id, event_name, block_number });
    }
    return startBlock.block_number;
  }

  async update(chain_id: string, event_name: string, block_number: number) {
    return await this.startBlockRepository.update(
      { chain_id, event_name },
      { block_number },
    );
  }
}
