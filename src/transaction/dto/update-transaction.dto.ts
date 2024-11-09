import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { ETransactionStatus } from 'src/@enums';

export class UpdateTransactionDTO {
  @ApiProperty({
    example: 'Active',
    description: 'Transaction status',
  })
  @IsIn(
    [
      ETransactionStatus.FAILED,
      ETransactionStatus.PENDING,
      ETransactionStatus.SUCCESS,
      ETransactionStatus.WITHDRAWN,
    ],
    {
      message: 'Invalid transaction status',
    },
  )
  status: string;
}
