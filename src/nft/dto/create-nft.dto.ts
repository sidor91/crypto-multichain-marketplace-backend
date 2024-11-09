import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';

import { CommonTokenDto } from 'src/@common/dto/common-token.dto';

export class CreateNftDto extends CommonTokenDto {
  @ApiProperty({
    example: 'Crypto multichain marketpalce',
    description: 'nft project_name',
  })
  @IsNotEmpty()
  @IsString()
  project_name: string;

  @ApiProperty({
    example: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7102.png',
    description: 'ipfs url of nft',
  })
  @IsNotEmpty()
  @IsString()
  ipfs_url: string;

  @ApiProperty({
    example: 456378,
    description: 'token_id of nft',
  })
  @IsNotEmpty()
  @IsString()
  token_id: string;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'erc20 address',
  })
  @IsNotEmpty()
  @IsString()
  owner: string;
}

export class CreateNftFromScratchDto {
  @IsNotEmpty()
  @IsString()
  project_name: string;

  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid address!' })
  readonly address: string;

  @IsNotEmpty()
  @IsString()
  token_id: string;

  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string integer!' })
  chain_id: string;

  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid contract address!' })
  readonly nft_wallet_address?: string;
}
