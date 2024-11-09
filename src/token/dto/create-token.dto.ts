import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

import { CommonTokenDto } from 'src/@common/dto/common-token.dto';

export class CreateTokenDto extends CommonTokenDto {
  @ApiProperty({
    example: 456378,
    description: 'coinmarketcap_id of token',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumber()
  readonly coinmarketcap_id: number;

  @ApiProperty({
    example: 18,
    description: 'token decimals',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumber()
  readonly decimals: number;
}
