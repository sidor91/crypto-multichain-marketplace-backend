import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly address: string;
}
