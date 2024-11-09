import { ApiProperty } from '@nestjs/swagger';

export class GetOrdersCreatedByMeResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [
      {
        id: '8930161d-77d9-45a1-8772-ff77275a9273',
        order_id:
          '0x5f953d95190188c3ac52a4749b899b61b2f5254c663a69f1e77678f81db19021',
        chain_id: '97',
        status: 'Active',
        type: 'NFT Key',
        name: 'Lil Pudgy #220',
        symbol: 'APE',
        image_url: 'https://api.pudgypenguins.io/lil/image/220',
        token_id: '220',
        offer_date: '2024-05-01T14:54:30.320Z',
        owner: '0x2e32217F8d2D297b34da1E1226A87C5c95420121',
        total_amount: '1000000000000000000',
        human_total_amount: 1,
        remain_amount: '1000000000000000000',
        human_remain_amount: 1,
        progress: 0,
        offer_price: '20000000000000000000',
        price_per_token: '20000000000000000000',
        offer_price_usdt: 20,
        offer_price_native: 0.036010613183617264,
        price_per_token_usdt: 20,
        price_per_token_native: 0.036010613183617264,
        token_market_price_usdt: 1.177145815077057,
        token_market_price_native: 0.002119487130372688,
        delta: 1599.0248568900345,
        vesting: {
          unclaimed: 8000,
          start_date: '2024-07-23T08:33:40.000Z',
          end_date: '2024-08-22T08:33:40.000Z',
          vesting_contract_address:
            '0xAb5f007b33EDDA56962A0fC428B15D544EA46591',
          vesting_remains: '17 days',
          vesting_duration: '30 days',
          symbol: 'LINA',
          streaming_frequency: '333.33 avg. per Day',
          claim_portal_url: 'https://app.sablier.com/',
        },
      },
      {
        id: '32cfaa27-2c08-4ce7-8af4-7e398e83d2de',
        order_id:
          '0xcb989fc1d27ca7e44efbcbebdcf5016919169b4a1f9517d2467b66baf7316335',
        chain_id: '97',
        status: 'Active',
        type: 'Token',
        name: 'InQubeta',
        symbol: 'QUBE',
        image_url: '',
        token_id: '',
        offer_date: '2024-05-01T14:54:30.078Z',
        owner: '0x2e32217F8d2D297b34da1E1226A87C5c95420121',
        total_amount: '10000000000000000000',
        human_total_amount: 10,
        remain_amount: '10000000000000000000',
        human_remain_amount: 10,
        progress: 0,
        offer_price: '10000000000000000000',
        offer_price_usdt: 10,
        offer_price_native: 0.018005306591808632,
        price_per_token: '1000000000000000000',
        price_per_token_usdt: 1,
        price_per_token_native: 0.0018005306591808634,
        token_market_price_usdt: 0.10968926956255548,
        token_market_price_native: 0.00019749889283053541,
        delta: 811.6662039851608,
        vesting: {
          unclaimed: 'No info',
          start_date: 'No info',
          end_date: 'No info',
          vesting_contract_address: null,
          vesting_remains: 'No info',
          vesting_duration: 'No info',
          symbol: 'No info',
          streaming_frequency: 'No info',
          claim_portal_url: 'No info',
        },
      },
    ],

    description: 'Orders filled by me',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 3,
    description: 'total elements',
  })
  readonly totalElements: number;
}
