import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class GetOrderDto {
  @ApiProperty({
    example: '97',
    description: 'ChainId',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly chainId: string;

  @ApiProperty({
    example: '0328be16-6e42-4eda-b33a-a37403c8b515',
    description: 'uuid orderId',
    required: false,
  })
  @IsNotEmpty()
  @IsUUID()
  readonly orderId: string;
}

export class GetOrderResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: {
      id: '0a7bf2c9-a071-42cb-b149-e8b5ee286c4e',
      order_id:
        '0xb62c10c227e181ad9bab1add6e29998358b3a3598c7d29270b00e0d22ef0d1df',
      chain_id: '97',
      status: 'Active',
      offer_date: '2024-05-06T14:48:24.568Z',
      description: 'Some description',
      owner: '0x2e32217F8d2D297b34da1E1226A87C5c95420121',
      total_amount: '1000000000000000000',
      human_total_amount: 1,
      remain_amount: '1000000000000000000',
      human_remain_amount: 1,
      progress: 0,
      is_crowd_fill: false,
      offer_price: '2000000000000000000',
      price_per_token: '2000000000000000000',
      offer_price_usdt: 2,
      offer_price_native: 0.003414640254996881,
      price_per_token_usdt: 2,
      price_per_token_native: 0.003414640254996881,
      token_market_price_usdt: 0.004898843706874085,
      token_market_price_native: 0.000008363894462215195,
      delta: 40725.960566849455,
      whitelist: '0x0000000000000000000000000000000000000000',
      name: 'Team Token',
      image_url: '',
      address: '0x2cC4d079E9AEa68efF0c9E97BE0E124cb045238c',
      transactionHistory: {},
      tokenDetail: {
        total_supply: 200050626,
        market_cap: null,
        circulating_supply: 200050626,
        transactions_count: 253,
        token_holders: 150,
        token_address: '0x2cC4d079E9AEa68efF0c9E97BE0E124cb045238c',
      },
    },

    description: 'Order info data',
    type: Object,
  })
  readonly data: object;
}
