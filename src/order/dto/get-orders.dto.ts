import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNumberString, IsOptional } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

import { ApplyFiltersDto } from 'src/sortingAndFiltering/dto/apply-filters.dto';

export class GetOrdersDto extends ApplyFiltersDto {
  @ApiProperty({
    example: '97',
    description: 'ChainId',
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Must be numeric string!' })
  readonly chainId?: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address',
    required: false,
  })
  @IsOptional()
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly user_address: string;
}

export class GetOrdersForMeDto extends ApplyFiltersDto {
  @ApiProperty({
    example: '97',
    description: 'ChainId',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be numeric string!' })
  readonly chainId: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address',
    required: false,
  })
  @IsOptional()
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly user_address: string;
}

export class GetOrdersByNftsResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [
      {
        id: 'd4c3ef92-7818-4f9a-b8c8-96ef62b285e1',
        order_id:
          '0xd2a939976a61e2984cb1ff2168f7e861b1cc4bbf910956ccd18dbd71d9ab86f1',
        chain_id: '97',
        status: 'Active',
        offer_date: '2024-04-29T15:15:02.836Z',
        description: '8,000 Timelocked LINA tokens',
        owner: '0xe36316FbDEE9f9CC92C4bDa8D1E682f5A97F910e',
        offer_price: '1000000',
        offer_price_usdt: 10,
        offer_price_native: 0.016326640800490313,
        nft_key: 'Sablier V2 Lockup Tranched #1',
        nft_id: '80',
        image_url: 'https://',
        whitelist: '0x0000000000000000000000000000000000000000',
        token_address: '0xe5A1b15ef85243bE9108a977Abb8217d9902780b',
        type: 'NFT Key',
        token_id: '80',
        vesting: {
          unclaimed: 8000,
          start_date: '2024-07-23T08:33:40.000Z',
          end_date: '2024-08-22T08:33:40.000Z',
          vesting_contract_address:
            '0xAb5f007b33EDDA56962A0fC428B15D544EA46591',
          is_valid_vesting_contract: true,
          vesting_remains: '17 days',
          vesting_duration: '30 days',
          symbol: 'LINA',
          streaming_frequency: '333.33 avg. per Day',
          claim_portal_url: 'https://app.sablier.com/',
        },
      },
    ],

    description: 'Orders Nfts page data',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 1,
    description: 'total elements',
  })
  readonly totalElements: number;
}

export class GetOrdersByTokensResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [
      {
        id: '74c56c4f-e645-46a1-ada3-3698c001bfe6',
        order_id:
          '0xd2a939976a61e2984cb1ff2168f7e861b1cc4bbf910956ccd18dbd71d9ab86f1',
        chain_id: '97',
        status: 'Active',
        offer_date: '2024-04-24T07:26:15.673Z',
        description: 'Some description',
        owner: '0xa0b89e155b1F49C2B02Ad6793F96B4c895FAb810',
        total_amount: '1000000000000000000',
        human_total_amount: 1,
        remain_amount: '1000000000000000000',
        human_remain_amount: 1,
        progress: 0,
        is_crowd_fill: false,
        offer_price: '10000000000000000000',
        price_per_token: '10000000000000000000',
        offer_price_usdt: 10,
        offer_price_native: 0.016326640800490313,
        price_per_token_usdt: 10,
        price_per_token_native: 0.016326640800490313,
        token_market_price_usdt: 1.349338012928742,
        token_market_price_native: 0.0022030157055534924,
        delta: 641.1041491594068,
        deciamls: 18,
        whitelist: '0x0000000000000000000000000000000000000000',
        name: 'TRON',
        symbol: 'TRX',
        image_url: '',
        token_address: '0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B',
        type: 'Token',
        token_id: '',
      },
      {
        id: '74c56c4f-e645-46a1-ada3-3698c001bfe6',
        order_id:
          '0xd2a939976a61e2984cb1ff2168f7e861b1cc4bbf910956ccd18dbd71d9ab86f1',
        status: 'Active',
        offer_date: '2024-04-24T07:26:15.673Z',
        description: 'Some description',
        owner: '0xa0b89e155b1F49C2B02Ad6793F96B4c895FAb810',
        total_amount: '1000000000000000000',
        human_total_amount: 1,
        remain_amount: '1000000000000000000',
        human_remain_amount: 1,
        progress: 0,
        is_crowd_fill: false,
        offer_price: '10000000000000000000',
        offer_price_usdt: 10,
        offer_price_native: 0.016326640800490313,
        price_per_token: '10000000000000000000',
        price_per_token_usdt: 10,
        price_per_token_native: 0.016326640800490313,
        token_market_price_usdt: 1.349338012928742,
        token_market_price_native: 0.0022030157055534924,
        delta: 641.1041491594068,
        whitelist: '0x0000000000000000000000000000000000000000',
        name: 'TRON',
        symbol: 'TRX',
        image_url: '',
        token_address: '0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B',
        type: 'Token',
        token_id: '',
      },
    ],

    description: 'Orders Tokens page data',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 3,
    description: 'total elements',
  })
  readonly totalElements: number;
}

export class GetOrdersByMeResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [
      {
        id: 'c49445d8-ae89-46b0-b3a8-017cc7bd04ec',
        order_id:
          '0xd2a939976a61e2984cb1ff2168f7e861b1cc4bbf910956ccd18dbd71d9ab86f1',
        chain_id: '97',
        status: 'Sold',
        type: 'NFT Key',
        name: 'Lil Pudgy #11814',
        symbol: 'APE',
        image_url: 'https://api.pudgypenguins.io/lil/image/11814',
        token_id: '11814',
        offer_date: '2024-04-29T15:15:02.836Z',
        description:
          'Lil Pudgys are a collection of 22,222 randomly generated NFTs minted on Ethereum.',
        owner: '0xa0b89e155b1F49C2B02Ad6793F96B4c895FAb810',
        total_amount: '1',
        remain_amount: '0',
        human_remain_amount: 0,
        progress: 100,
        is_crowd_fill: false,
        offer_price: '5000000000000000000',
        offer_price_usdt: 5,
        offer_price_native: 0.008609601076739627,
        price_per_token: '5000000000000000000',
        price_per_token_usdt: 5,
        price_per_token_native: 0.008609601076739627,
        token_market_price_usdt: 1.1789879412673967,
        token_market_price_native: 0.002030123169719763,
        delta: 324.09254793777325,
        decimals: 18,
        whitelist: '0x0000000000000000000000000000000000000000',
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
        id: '212da8ec-e5ff-4d11-bacd-c659d0f7d209',
        order_id:
          '0x9ade6baecc70a6662e12822cf0b8a30411850903dd67b48f5c9022ee6cd1b36e',
        chain_id: '97',
        status: 'Active',
        type: 'Token',
        name: 'busd',
        symbol: 'busd',
        image_url: '',
        token_id: '',
        offer_date: '2024-04-29T15:10:37.667Z',
        description: 'Some description',
        owner: '0x7ff7DAb2f9538613E68ddeAAb823DF55CEB56c42',
        total_amount: '11000000000000000000',
        remain_amount: '11000000000000000000',
        human_remain_amount: 11,
        progress: 0,
        is_crowd_fill: false,
        offer_price: '1000000000000000000',
        offer_price_usdt: 5,
        offer_price_native: 0.008609601076739627,
        price_per_token: '90909090909090909',
        price_per_token_usdt: 0.09090909090909091,
        price_per_token_native: 0.00015653820139526595,
        token_market_price_usdt: 1.0000596257712018,
        token_market_price_native: 0.0017220228861687134,
        delta: -90.909632929238,
        whitelist: '0x0000000000000000000000000000000000000000',
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

    description: 'Orders by me page data',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 36,
    description: 'total elements',
  })
  readonly totalElements: number;
}

export class GetTokenOrderDetailsDto {
  @ApiProperty({
    example: 'b655d03d-7624-47d9-afdc-8a86afb714c6',
    description: 'Order id from db (not from blockchain!)',
  })
  readonly orderId: string;

  @ApiProperty({
    example: '97',
    description: 'Chain Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string!' })
  readonly chainId: string;
}

export class GetTokenOrderDetailsResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: {
      tokenDetail: {
        total_supply: 200020163,
        market_cap: 110419102944,
        circulating_supply: 110463515619.005,
        transactions_count: 236048216,
        token_holders: 150,
        token_address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
      },
      transactionHistory: [
        {
          address: '0x99824818480d6178b1f5d9DA6A42810Ea97edDE4',
          amount: 12,
          price_usdt: 123456,
          price_native: 123456,
          payment_date: '2024-04-03T22:45:56.050Z',
        },
        {
          address: '0x99824818480d6178b1f5d9DA6A42810Ea97edDE4',
          amount: 12,
          price_usdt: 123456,
          price_native: 123456,
          payment_date: '2024-04-03T22:45:56.050Z',
        },
        {
          address: '0x99824818480d6178b1f5d9DA6A42810Ea97edDE4',
          amount: 12,
          price_usdt: 123456,
          price_native: 123456,
          payment_date: '2024-04-03T22:45:56.050Z',
        },
      ],
    },
    description: 'Token order details and transactions history',
    type: Object,
  })
  readonly data: object[];
}
