import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

import { ApplyFiltersDto } from 'src/sortingAndFiltering/dto/apply-filters.dto';

export class GetTransactionsFilledByMeDto extends ApplyFiltersDto {
  @ApiProperty({
    example: '97',
    description: 'The chain ID',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be numeric string!' })
  readonly chainId: string;
}

export class GetTransactionsFilledByMeResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [
      {
        id: '92808bdb-abae-4f47-a226-a42347be6fff',
        created_at: '2024-05-02T10:32:31.647Z',
        updated_at: '2024-05-02T10:32:31.647Z',
        chain_id: '97',
        tx_hash:
          '0x0c9d0b5d44221b17216bbd7356808c83634a7b414385e37a64bc5dc892577824',
        payment_date: '2024-05-02T10:32:31.646Z',
        status: 'SUCCESS',
        orderType: 'NFT Key',
        order_id:
          '0x9b8938ae7266266f7f5b0c4930dd4e72ef2b781e2eb7aa0100647557a6b8c37d',
        image_url: '',
        name: 'Sablier V2 Lockup Tranched #1',
        symbol: 'SAB-V2-LOCKUP-TRA',
        human_amount: 1,
        price_usdt: 1,
        price_native: 0.0017878950797532286,
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
        id: 'c38bfaeb-89c6-4a88-ba15-e838ebc99766',
        created_at: '2024-05-02T10:46:17.476Z',
        updated_at: '2024-05-02T10:46:17.476Z',
        chain_id: '97',
        tx_hash:
          '0xfa1057b0da4927fba619dea6fb4647cbc39a117771f714c39087db4b749e2422',
        payment_date: '2024-05-02T10:46:17.472Z',
        status: 'SUCCESS',
        orderType: 'Token',
        order_id:
          '0x0984d207baf815370d87b3c905e0e3363abb917ada40487c2cf910732311e3db',
        image: '',
        name: 'Team Token',
        symbol: 'TT',
        human_amount: 1,
        price_usdt: 1,
        price_native: 0.0017878950797532286,
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
    example: 2,
    description: 'total elements',
  })
  readonly totalElements: number;
}
