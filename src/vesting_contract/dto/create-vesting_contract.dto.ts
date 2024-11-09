import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

import { EVestingContractType } from 'src/@enums';

export class CreateVestingContractDto {
  @ApiProperty({
    example: 'LINA',
    description: 'token symbol  (optional)',
  })
  @IsOptional()
  @IsString()
  readonly symbol: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address of vesting contract',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly address: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address of token in vesting  (optional)',
  })
  @IsOptional()
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly token_address: string;

  @ApiProperty({
    example: '1056435456',
    description: 'The token ID of the NFT',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be number!' })
  readonly token_id: string;

  @ApiProperty({
    example: '97',
    description: 'chainId',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be a string number' })
  readonly chain_id: string;

  @ApiProperty({
    example: EVestingContractType.LINEAR,
    description: 'Vesting contract type',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEnum(EVestingContractType)
  readonly type: EVestingContractType;
}
