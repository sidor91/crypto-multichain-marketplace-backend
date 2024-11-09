import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class ListVestingDto {
  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly nft_wallet_address: string;

  @ApiProperty({
    example: 1056435456,
    description: 'Token Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be number!' })
  readonly token_id: string;

  @ApiProperty({
    example: '97',
    description: 'Chain Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string integer!' })
  readonly chainId: string;

  @IsOptional()
  @IsEthereumAddress()
  readonly token_address?: string;
}

export class ListVestingDtoResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: {},
    description: 'Vestings data',
    type: Object,
  })
  readonly data: object[];
}
