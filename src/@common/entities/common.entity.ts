import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export abstract class CommonColumns {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'unique id',
  })
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ApiProperty({
    example: '97',
    description: 'The chain ID',
  })
  @Column({
    type: 'varchar',
    name: 'chain_id',
    nullable: false,
  })
  @IsNumberString(
    {},
    {
      message: 'Must be string integer',
    },
  )
  chain_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at?: string;
}
