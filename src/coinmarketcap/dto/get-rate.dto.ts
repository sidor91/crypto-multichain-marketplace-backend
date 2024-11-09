import { ApiProperty } from '@nestjs/swagger';

export class GetBnbRateResponseDTO {
  @ApiProperty({
    example: 599.41,
    description: 'Native token to USDT rate',
  })
  readonly rate: number;
}
