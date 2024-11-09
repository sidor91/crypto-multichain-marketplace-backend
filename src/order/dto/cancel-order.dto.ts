import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({
    example: 'd4c3ef92-7818-4f9a-b8c8-96ef62b285e1',
    description: 'orderId',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Must be a string' })
  id: string;
}

export class CancelOrderResponseDto {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: 'Order was successfully canceled',
    description: 'Success/Error message',
  })
  message: string;
}
