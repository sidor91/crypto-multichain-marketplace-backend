import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

import { ApplyFiltersDto } from 'src/sortingAndFiltering/dto/apply-filters.dto';

export class GetCreatedByMeDto extends ApplyFiltersDto {
  @ApiProperty({
    example: '97',
    description: 'The chain ID',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be numeric string!' })
  readonly chainId: string;
}
