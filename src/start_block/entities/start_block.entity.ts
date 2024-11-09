import { Column, Entity } from 'typeorm';

import { CommonColumns } from '../../@common/entities/common.entity';

@Entity({ name: 'start_blocks' })
export class StartBlock extends CommonColumns {
  @Column()
  chain_id: string;

  @Column()
  event_name: string;

  @Column()
  block_number: number;
}
