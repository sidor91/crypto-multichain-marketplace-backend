import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonTokenColumns } from '../../@common/entities/commonToken.entity';
import { Order } from '../../order/entities/order.entity';
import { Vesting } from '../../vesting/entities/vesting.entity';

@Entity({ name: 'nfts' })
export class Nft extends CommonTokenColumns {
  @ApiProperty({
    example: 'Crypto multichain marketpalce',
    description: 'nft project_name',
  })
  @Column()
  project_name: string;

  @ApiProperty({
    example: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7102.png',
    description: 'ipfs url of nft',
  })
  @Column()
  ipfs_url: string;

  @ApiProperty({
    example: '456378',
    description: 'token_id of nft',
  })
  @Column()
  token_id: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'erc20 address',
  })
  @Column()
  owner: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'nft wallet address',
  })
  @Column({ default: '0x0000000000000000000000000000000000000000' })
  nft_wallet_address: string;

  @OneToMany(() => Vesting, (vestings) => vestings.nft)
  @JoinColumn({ name: 'vesting_id', referencedColumnName: 'id' })
  vestings: Vesting[];

  @OneToMany(() => Order, (orders) => orders.nft)
  @JoinColumn({ name: 'nft_id', referencedColumnName: 'id' })
  orders: Order[];
}
