import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUrl,
} from 'class-validator';

export class CommonTokenDto {
  @ApiProperty({
    example: '97',
    description: 'The chain ID',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be a string number' })
  chain_id: string;

  @ApiProperty({
    example: 'Tether USD',
    description: 'token name',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'LINA',
    description: 'token symbol',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString()
  readonly symbol: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly address: string;

  @ApiProperty({
    example: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7102.png',
    description: 'url of token logo',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsUrl()
  readonly image_url: string;
}
