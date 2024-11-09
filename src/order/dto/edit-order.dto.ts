import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

import { bigintRegex } from 'src/@constants';

export class EditOrder {
  @ApiProperty({
    example: 'd4c3ef92-7818-4f9a-b8c8-96ef62b285e1',
    description: 'orderId',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Must be a string' })
  id: string;

  @ApiProperty({
    example:
      'The Bored APE YACHT CLUB is a collection of up to 20,000 Mutant Apes that can only be created by exposing an existing.',
    description: 'new description',
  })
  @IsString({ message: 'Must be a string' })
  @IsOptional()
  description: string;

  @ApiProperty({
    example: '123456789',
    description: 'new price',
  })
  @IsOptional()
  @Matches(bigintRegex, undefined, {
    message: 'Amount must be positive BigInt string',
  })
  new_price: bigint;
}

export class EditResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: 'Order was successfully updated',
    description: 'Success/Error message',
  })
  message: string;
}
