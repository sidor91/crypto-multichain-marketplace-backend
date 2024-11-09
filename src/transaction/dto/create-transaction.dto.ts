import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { bigintRegex } from 'src/@constants';

export class CreateTransactionDTO {
  @ApiProperty({
    example: '97',
    description: 'The chain ID',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string integer!' })
  chain_id: string;

  @ApiProperty({
    example:
      '0xe72929a1bd3bb24a28858a410e645cf30b5a62dd1ef16e15560c65b68cc9b0c5',
    description: 'Transaction hash',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString()
  tx_hash: string;

  @ApiProperty({
    example: '123456789',
    description: 'Transaction amount',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @Matches(bigintRegex, undefined, {
    message: 'Amount must be positive BigInt string',
  })
  amount: bigint;

  @ApiProperty({
    example: '4c8f1e91-afdc-4929-956b-85e8ee9b0b05',
    description: 'Order ID',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString()
  orderId: string;

  @ApiProperty({
    example: 'Active',
    description: 'Status transaction',
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateTransactionResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: 'Transaction successfully created in th DB',
    description: 'message',
  })
  readonly message: string;
}
