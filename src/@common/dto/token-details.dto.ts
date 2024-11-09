import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';

export class GetTokenDetailsDto {
  @ApiProperty({
    example: '0x53a38d12b84a7413eda4b1206a7a28b59aed9850',
    description: 'unique erc20 address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly token_address: string;

  @ApiProperty({
    example: 'Snake Token',
    description: 'Token name',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Must be string!' })
  readonly token_name: string;

  @ApiProperty({
    example: '56',
    description: 'Chain Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string!' })
  readonly chainId: string;

  @ApiProperty({
    example: 'SNK',
    description: 'Token symbol',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Must be string!' })
  readonly symbol: string;
}

export class GetTokenDetailsResponseDto {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: {
      total_supply: 200020163,
      market_cap: 110419102944,
      circulating_supply: 110463515619.005,
      transactions_count: 236048216,
      token_holders: 150,
      token_address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    },
    description: 'Orders Nfts page data',
    type: Object,
  })
  readonly data: object[];
}
