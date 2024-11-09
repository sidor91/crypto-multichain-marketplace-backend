import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { Order } from '../../order/entities/order.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'unique id',
  })
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address',
  })
  @Column({ unique: true })
  address: string;

  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken: string;

  @OneToMany(() => Order, (orders) => orders.user)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  orders: Order[];

  @OneToMany(() => Transaction, (transactions) => transactions.user)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  transactions: Transaction;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at?: string;
}
