import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';

import { ApplyFiltersDto } from 'src/sortingAndFiltering/dto/apply-filters.dto';

export class GetUserInfoDTO extends ApplyFiltersDto {
  @ApiProperty({
    example: '97',
    description: 'ChainId',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString()
  readonly chainId: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly address: string;
}
