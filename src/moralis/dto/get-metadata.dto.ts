import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';

export class GetContractERC20MetadataDTO {
  @ApiProperty({
    example: '97',
    description: 'Chain Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be integer!' })
  readonly chainId: string;

  @ApiProperty({
    example: ['0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66'],
    description: 'Array of Token Addresses',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsArray()
  @IsEthereumAddress({ each: true, message: 'Not valid address!' })
  readonly tokenAddresses: string[];
}

export class GetNFTsByUserDTO {
  @ApiProperty({
    example: '97',
    description: 'Chain Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string integer!' })
  readonly chainId: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'User Address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly userAddress: string;
}

export class GetNFTMetadataDTO {
  @ApiProperty({
    example: 1056435456,
    description: 'Token Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be number!' })
  readonly tokenId: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'Token Address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly tokenAddress: string;

  @ApiProperty({
    example: '97',
    description: 'Chain Id',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string integer!' })
  readonly chainId: string;
}
