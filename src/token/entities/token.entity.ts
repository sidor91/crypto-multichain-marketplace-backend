import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonTokenColumns } from '../../@common/entities/commonToken.entity';
import { Order } from '../../order/entities/order.entity';

@Entity({ name: 'tokens' })
export class Token extends CommonTokenColumns {
  @ApiProperty({
    example: 18,
    description: 'Number of decimal',
  })
  @Column({ default: 0 })
  decimals: number;

  @ApiProperty({
    example: 456378,
    description: 'coinmarketcap_id of token',
  })
  @Column()
  coinmarketcap_id: number;

  @OneToMany(() => Order, (orders) => orders.token)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  orders: Order[];
}
