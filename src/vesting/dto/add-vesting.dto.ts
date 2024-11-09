import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEthereumAddress,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

import { bigintRegex } from 'src/@constants';
import { CreateVestingContractDto } from 'src/vesting_contract/dto/create-vesting_contract.dto';

export class AddVestingDto extends CreateVestingContractDto {
  @ApiProperty({
    example: '0x6Fe3A871f87D4eC21911AD359DaF569D31A804b9',
    description: 'NFT wallet address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid contract address!' })
  readonly nft_wallet_address: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'Metamask wallet address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid user address!' })
  readonly user_address: string;

  @ApiProperty({
    example: '2024-02-08 18:37:21.037797+00',
    description: 'Vesting start time (optional)',
  })
  @IsOptional()
  @IsDateString()
  readonly start_time?: Date;

  @ApiProperty({
    example: '2024-12-08 18:37:21.037797+00',
    description: 'Vesting end time (optional)',
  })
  @IsOptional()
  @IsDateString()
  readonly end_time?: Date;

  @ApiProperty({
    example: '123456789',
    description: 'Unclaimed amount in wei (optional)',
  })
  @IsOptional()
  @Matches(bigintRegex, undefined, {
    message: 'unclaimed_amount must be positive BigInt string',
  })
  readonly unclaimed_amount?: bigint;

  @ApiProperty({
    example: '456378',
    description: 'Streaming frequency (optional)',
  })
  @IsOptional()
  @IsString()
  readonly streaming_frequency?: string;

  @ApiProperty({
    example: 'Some URL',
    description: 'Claim portal url',
  })
  @IsOptional()
  @IsUrl()
  readonly claim_portal_url: string;
}
