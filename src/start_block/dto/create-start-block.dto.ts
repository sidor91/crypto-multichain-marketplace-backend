import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateStartBlockDto {
  @ApiProperty({
    example: '97',
    description: 'Chain Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string integer!' })
  readonly chain_id: string;

  @ApiProperty({
    example: 'Create',
    description: 'Event name',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Must be string!' })
  readonly event_name: string;

  @ApiProperty({
    example: 39865694,
    description: 'Blockchain blocknumber',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsInt({ message: 'Must be integer!' })
  block_number: number;
}
