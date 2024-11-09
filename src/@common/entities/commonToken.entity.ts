import { Column } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonColumns } from './common.entity';

export abstract class CommonTokenColumns extends CommonColumns {
  @ApiProperty({
    example: 'Thether USD',
    description: 'nft name',
  })
  @Column({ nullable: true })
  name?: string;

  @ApiProperty({
    example: 'LINA',
    description: 'nft symbol',
  })
  @Column()
  symbol: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'token or nft collection address',
  })
  @Column()
  address: string;

  @ApiProperty({
    example: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7102.png',
    description: 'url of token logo',
  })
  @Column({ nullable: true })
  image_url: string;
}
