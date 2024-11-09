import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetTransactionsByOrderDTO {
  @ApiProperty({
    example: '1045b832-91d2-4fea-826b-ac2b21a947a8',
    description: 'Order ID',
  })
  @IsUUID()
  readonly orderId: string;
}
