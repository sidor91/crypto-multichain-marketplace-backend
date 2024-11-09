import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonColumns } from '../../@common/entities/common.entity';
import { ETransactionStatus } from '../../@enums';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../user/entities/user.entity';
import { bigIntTransformer } from '../../utils';

@Entity({ name: 'transactions' })
export class Transaction extends CommonColumns {
  @ApiProperty({
    example: 'Transaction hash',
    description:
      '0xe72929a1bd3bb24a28858a410e645cf30b5a62dd1ef16e15560c65b68cc9b0c5',
  })
  @Column({ unique: true })
  tx_hash: string;

  @ApiProperty({
    example: 123456789n,
    description: 'Transaction amount',
  })
  @Column({
    default: 0n,
    type: 'decimal',
    transformer: bigIntTransformer,
  })
  amount: bigint;

  @ApiProperty({
    example: '2024-04-03 18:15:05.743484+05',
    description: 'Payment Date transaction',
  })
  @Column({ type: 'timestamptz' })
  payment_date: Date;

  @ApiProperty({
    example: ETransactionStatus.PENDING,
    description: 'Transaction status',
  })
  @Column({ default: ETransactionStatus.PENDING })
  status?: string;

  @ManyToOne(() => Order, (order) => order.transactions)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
