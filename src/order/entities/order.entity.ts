import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonColumns } from '../../@common/entities/common.entity';
import { OrderStatusType } from '../../@enums';
import { Nft } from '../../nft/entities/nft.entity';
import { Token } from '../../token/entities/token.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { User } from '../../user/entities/user.entity';
import { bigIntTransformer } from '../../utils';

@Entity({ name: 'orders' })
export class Order extends CommonColumns {
  @ApiProperty({
    example:
      '0xac84512ae9cf5c44e9275a6895616f1d8b862a56d8148d787952b893972398c2',
    description: 'Order Id',
  })
  @Column({ default: '' })
  order_id: string;

  @ApiProperty({
    example: 123456789n,
    description: 'offer price of token',
  })
  @Column({
    type: 'decimal',
    transformer: bigIntTransformer,
  })
  offer_price: bigint;

  @ApiProperty({
    example: 123456789n,
    description: 'offer price of token',
  })
  @Column({
    default: 0n,
    type: 'decimal',
    transformer: bigIntTransformer,
  })
  price_per_token: bigint;

  @ApiProperty({
    example: 123456789n,
    description: 'total order token amount',
  })
  @Column({
    default: 1n,
    type: 'decimal',
    transformer: bigIntTransformer,
  })
  amount: bigint;

  @ApiProperty({
    example: 12345n,
    description: 'remain order token amount',
  })
  @Column({
    default: 1n,
    type: 'decimal',
    transformer: bigIntTransformer,
  })
  remain_amount: bigint;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'whitelisted user address',
  })
  @Column({ nullable: true })
  whitelist: string;

  @ApiProperty({
    example: true,
    description: 'Is order crowd fill (purchaseable partly)',
  })
  @Column({ default: false })
  is_crowd_fill: boolean;

  @ApiProperty({
    example: true,
    description: 'Is order closed',
  })
  @Column({ default: false })
  is_closed: boolean;

  @ApiProperty({
    example: 'Some token description',
    description: 'token description',
  })
  @Column({ type: 'text', default: '' })
  description: string;

  @ApiProperty({
    example: true,
    description: 'Order status',
  })
  @Column({ default: OrderStatusType.PENDING })
  status: string;

  @ApiProperty({
    example: 'Transaction hash',
    description:
      '0xe72929a1bd3bb24a28858a410e645cf30b5a62dd1ef16e15560c65b68cc9b0c5',
  })
  @Column({ unique: true, default: null })
  tx_hash: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Token, (token) => token.orders)
  @JoinColumn({ name: 'token_id', referencedColumnName: 'id' })
  token: Token;

  @ManyToOne(() => Nft, (nft) => nft.orders)
  @JoinColumn({ name: 'nft_id', referencedColumnName: 'id' })
  nft: Nft;

  @OneToMany(() => Transaction, (transactions) => transactions.order)
  @JoinColumn({ name: 'transaction_id', referencedColumnName: 'id' })
  transactions: Transaction[];
}
