import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';

export class CheckVestingContractDto {
  @ApiProperty({
    example: '0xa7BD4A0f5F9254815E45C271f0cd44140aa5FFea',
    description: 'unique erc20 address of vesting contract',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly address: string;

  @ApiProperty({
    example: '97',
    description: 'chain_id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be a string number' })
  readonly chain_id: string;
}

export class CheckVestingContractDtoResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: 'LINEAR',
    description: 'vesting contract type',
  })
  readonly type: string;
}
