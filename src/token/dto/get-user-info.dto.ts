import { ApiProperty } from '@nestjs/swagger';

export class GetUserInfoResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [
      {
        name: 'PancakeSwap Token',
        symbol: 'Cake',
        token_address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
        logo: 'https://logo.moralis.io/0x38_0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82_d346d39bd9e2410d88ea826e2dbe7bd3',
        decimals: 18,
        amount: '1450746665339004796109',
        human_amount: 1450.7466653390047,
        price_usdt: 3565.8091950854055,
        price_native: 6.484963605380609,
        token_market_price_usdt: 2.05,
      },
      {
        name: 'Tether USD',
        symbol: 'USDT',
        token_address: '0x55d398326f99059ff775485246999027b3197955',
        logo: 'https://logo.moralis.io/0x38_0x55d398326f99059ff775485246999027b3197955_35928e46ec624f60b1d2c13291cb0d27',
        decimals: 18,
        amount: '39846468008459409966939',
        human_amount: 39846.46800845941,
        price_usdt: 39795.11749112789,
        price_native: 72.37344302030961,
        token_market_price_usdt: 2.05,
      },
    ],

    description: 'Accounts page data',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 2,
    description: 'total elements',
  })
  readonly totalElements: number;
}
