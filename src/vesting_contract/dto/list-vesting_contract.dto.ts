import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ListVestingContractDto {
  @ApiProperty({
    example: '97',
    description: 'Chain ID',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be a string number' })
  readonly chainId: string;
}

export class ListVestingContractDtoResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [],

    description: 'vestingContracts list',
    type: Object,
  })
  readonly 'vestingContracts': object[];
}
