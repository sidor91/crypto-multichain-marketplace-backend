import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Validate,
} from 'class-validator';

import { BaseOrderResponseDto } from 'src/@common/dto/default-response.dto';
import { bigintRegex } from 'src/@constants';
import { AddVestingDto } from 'src/vesting/dto/add-vesting.dto';

export class CreateOrderDto {
  @ApiProperty({
    example: '97',
    description: 'The chain ID',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be numeric string!' })
  readonly chain_id: string;

  @ApiProperty({
    example: '123456789',
    description: 'The total amount of tokens (NFT or other) in the order',
  })
  @Matches(bigintRegex, undefined, {
    message: 'Amount must be positive BigInt string',
  })
  amount: bigint;

  @ApiProperty({
    example: '123456789',
    description: 'The offer price of the token or NFT',
  })
  @Matches(bigintRegex, undefined, {
    message: 'Offer price must be positive BigInt string',
  })
  offer_price: bigint;

  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'The Ethereum address of a whitelisted user (optional)',
  })
  @IsOptional()
  @Validate(IsEthereumAddress, {
    message: 'Not valid Ethereum address!',
  })
  whitelist: string;

  @ApiProperty({
    example:
      '0xe72929a1bd3bb24a28858a410e645cf30b5a62dd1ef16e15560c65b68cc9b0c5',
    description: 'The transaction hash for the order',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString()
  tx_hash: string;

  @ApiProperty({
    example: 'Some token description',
    description: 'token description',
  })
  @IsString()
  description: string;
}

export class CreateOrderForNftDto extends IntersectionType(
  CreateOrderDto,
  AddVestingDto,
) {
  @ApiProperty({
    example: '1056435456',
    description: 'The token ID of the NFT',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be number!' })
  readonly token_id: string;

  @ApiProperty({
    example: 'Crypto multichain marketpalce',
    description: 'The name of the NFT project',
  })
  @IsNotEmpty()
  @IsString()
  project_name: string;

  @ApiProperty({
    example: '0x6Fe3A871f87D4eC21911AD359DaF569D31A804b9',
    description: 'NFT collection address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid contract address!' })
  readonly nft_address: string;
}

export class CreateOrderForTokenDto extends CreateOrderDto {
  @ApiProperty({
    example: '0x6Fe3A871f87D4eC21911AD359DaF569D31A804b9',
    description: 'The ERC20 token address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid contract address!' })
  readonly token_address: string;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the order can be partially filled',
  })
  @IsOptional()
  @IsBoolean()
  is_crowd_fill: boolean;

  @ApiProperty({
    example: '97',
    description: 'The chain ID where the order is created',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsNumberString({}, { message: 'Must be string integer!' })
  readonly chain_id: string;
}

export class ValidateOrderResponseDto extends PartialType(
  BaseOrderResponseDto,
) {
  @ApiProperty({
    example: 'Successful validation for order creation',
    description: 'The validation message for the order',
  })
  readonly message: string;
}

export class CreateOrderResponseDto extends PartialType(BaseOrderResponseDto) {
  @ApiProperty({
    example: 'The order was successfully created',
    description: 'The creation message for the order',
  })
  readonly message: string;
}

export class GetNftWalletAddressResponseDto {
  @ApiProperty({
    example: true,
    description: 'Success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: '0x6Fe3A871f87D4eC21911AD359DaF569D31A804b9',
    description: 'The ERC20 token address',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEthereumAddress({ message: 'Not valid contract address!' })
  readonly address: string;
}
