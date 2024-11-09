import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { FilterAndSortArgs, SortBy, SortOrder } from './types';

export class ApplyFiltersDto implements FilterAndSortArgs {
  @ApiProperty({
    example: 'ASC',
    description: 'sort order',
    required: false,
  })
  @IsOptional()
  sortOrder: SortOrder;

  @ApiProperty({
    example: 'name',
    description: 'sorting property',
    required: false,
  })
  @IsOptional()
  sortBy: SortBy;

  @ApiProperty({
    example: 1,
    description: 'pagination page',
    required: false,
  })
  @IsOptional()
  page: string;

  @ApiProperty({
    example: 10,
    description: 'number of items per page',
    required: false,
  })
  @IsOptional()
  limit: string;

  @ApiProperty({
    example: 'Azuki',
    description: 'searching query',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'query must be a string' })
  query: string;
}
