import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Matches } from 'class-validator';

import { bigintRegex } from 'src/@constants';

import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    example: '123456789',
    description: 'The price per token (NFT or other) in the order',
  })
  @Matches(bigintRegex, undefined, {
    message: 'PricePerToken must be positive BigInt string',
  })
  price_per_token?: bigint;
}
