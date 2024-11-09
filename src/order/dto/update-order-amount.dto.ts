import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateTransactionDTO } from 'src/transaction/dto/create-transaction.dto';

export class UpdateOrderAmountDto extends PartialType(CreateTransactionDTO) {
  @ApiProperty({
    example: 'Active',
    description: 'Status transaction',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString()
  status?: string;
}
