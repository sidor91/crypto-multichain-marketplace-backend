import { ApiProperty } from '@nestjs/swagger';

class BaseTransactionResponse {
  @ApiProperty({
    example: true,
    description: 'Success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [],
    description: 'Transactions page data',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 0,
    description: 'total elements',
  })
  readonly totalElements: number;
}

export class GetAllTransactionsResponse extends BaseTransactionResponse {
  @ApiProperty({
    example: [
      {
        id: 'af72d446-9ff9-464e-a0be-021458835a57',
        chain_id: '97',
        created_at: '2024-04-03T22:41:45.663Z',
        updated_at: '2024-04-03T22:41:45.663Z',
        tx_hash: '012345',
        amount: '1',
        payment_date: '2024-04-03T22:41:45.660Z',
      },
      {
        id: '91b2ad1a-e853-4d57-ad9a-33360a35560b',
        chain_id: '97',
        created_at: '2024-04-03T22:45:56.051Z',
        updated_at: '2024-04-03T22:45:56.051Z',
        tx_hash: '123',
        amount: '1',
        payment_date: '2024-04-03T22:45:56.050Z',
      },
      {
        id: 'c5cdfc7d-69ca-40e1-be2d-95033b8a7ea2',
        chain_id: '97',
        created_at: '2024-04-03T22:47:13.239Z',
        updated_at: '2024-04-03T22:47:13.239Z',
        tx_hash: '1235',
        amount: '1',
        payment_date: '2024-04-03T22:47:13.237Z',
      },
    ],

    description: 'Transactions page data',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 3,
    description: 'total elements',
  })
  readonly totalElements: number;
}

export class GetMyTransactionsResponse extends BaseTransactionResponse {
  @ApiProperty({
    example: [
      {
        id: 'af72d446-9ff9-464e-a0be-021458835a57',
        created_at: '2024-04-03T22:41:45.663Z',
        updated_at: '2024-04-03T22:41:45.663Z',
        tx_hash: '012345',
        amount: '1',
        payment_date: '2024-04-03T22:41:45.660Z',
        orders: null,
      },
      {
        id: '91b2ad1a-e853-4d57-ad9a-33360a35560b',
        created_at: '2024-04-03T22:45:56.051Z',
        updated_at: '2024-04-03T22:45:56.051Z',
        tx_hash: '123',
        amount: '1',
        payment_date: '2024-04-03T22:45:56.050Z',
        orders: null,
      },
      {
        id: 'c5cdfc7d-69ca-40e1-be2d-95033b8a7ea2',
        created_at: '2024-04-03T22:47:13.239Z',
        updated_at: '2024-04-03T22:47:13.239Z',
        tx_hash: '1235',
        amount: '1',
        payment_date: '2024-04-03T22:47:13.237Z',
        orders: null,
      },
    ],

    description: 'Transactions page data',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 3,
    description: 'total elements',
  })
  readonly totalElements: number;
}
