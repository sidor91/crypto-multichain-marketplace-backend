import { ApiProperty } from '@nestjs/swagger';

export class BaseOrderResponseDto {
  @ApiProperty({
    example: true,
    description: 'Success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: 'Default message',
    description: 'Message',
  })
  readonly message: string;
}
