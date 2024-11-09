import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

import { bigintRegex } from 'src/@constants';

export class CreateVestingDto {
  @ApiProperty({
    example: '2024-04-02 08:13:03.743484+03',
    description: 'End of vesting date',
  })
  @IsNotEmpty()
  @IsDate()
  end_date: Date;

  @ApiProperty({
    example: '456378',
    description: 'Total vesting amount',
  })
  @IsNotEmpty()
  @Matches(bigintRegex, undefined, {
    message: 'total_vesting_amount must be positive BigInt string',
  })
  total_vesting_amount: bigint;

  @ApiProperty({
    example: 'VESTING',
    description: 'Type vesting',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Must be string!' })
  type: string;

  @ApiProperty({
    example: '456378',
    description: 'Streaming frequency',
  })
  @IsString()
  readonly streaming_frequency: string;

  @ApiProperty({
    example: 'Some URL',
    description: 'Claim portal url',
  })
  @IsOptional()
  @IsUrl()
  readonly claim_portal_url: string;
}
