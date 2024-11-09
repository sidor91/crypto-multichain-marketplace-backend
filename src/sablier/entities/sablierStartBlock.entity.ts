import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { IsNumberString } from 'class-validator';

@Entity({ name: 'start_block_sablier' })
export class StartBlockSablier {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'varchar',
    name: 'chain_id',
    nullable: false,
  })
  @IsNumberString({}, { message: 'Must be a string number' })
  chain_id: string;

  @Column()
  block_number: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at?: string;
}
