import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';

export class GetNftWalletAddressDto {
  @ApiProperty({
    example: '0x6Fe3A871f87D4eC21911AD359DaF569D31A804b9',
    description: 'The ERC20 token address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid contract address!' })
  readonly token_address: string;

  @ApiProperty({
    example: '1056435456',
    description: 'The token ID of the NFT',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be number!' })
  readonly token_id: string;

  @ApiProperty({
    example: '97',
    description: 'The chain ID',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be numeric string!' })
  readonly chain_id: string;
}
