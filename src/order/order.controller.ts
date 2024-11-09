import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetCurrentUserId, Public } from 'src/@common/decorators';
import { GetCurrentUserAddress } from 'src/@common/decorators/get-current-user-address.decorator';
import { AtGuard } from 'src/@common/guards';

import { CancelOrderDto, CancelOrderResponseDto } from './dto/cancel-order.dto';
import {
  CreateOrderForNftDto,
  CreateOrderForTokenDto,
  CreateOrderResponseDto,
  GetNftWalletAddressResponseDto,
} from './dto/create-order.dto';
import { EditOrder, EditResponse } from './dto/edit-order.dto';
import { GetCreatedByMeDto } from './dto/get-created-by-me.dto';
import { GetOrdersCreatedByMeResponse } from './dto/get-my-orders.dto';
import { GetNftWalletAddressDto } from './dto/get-nft-wallet-address.dto';
import { GetOrderDto, GetOrderResponse } from './dto/get-order.dto';
import {
  GetOrdersByMeResponse,
  GetOrdersByNftsResponse,
  GetOrdersByTokensResponse,
  GetOrdersDto,
  GetOrdersForMeDto,
  GetTokenOrderDetailsDto,
  GetTokenOrderDetailsResponse,
} from './dto/get-orders.dto';
import { OrderService } from './order.service';

@ApiTags('Order API')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('nft_wallet_address')
  @ApiOperation({
    summary: 'Automatic receipt of the nft wallet address of the created NFT',
  })
  @ApiResponse({
    status: 200,
    type: GetNftWalletAddressResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async getNftWalletAddress(@Query() dto: GetNftWalletAddressDto) {
    return this.orderService.checkNftWalletAddress(dto);
  }

  @Post('create/nft')
  @ApiOperation({ summary: 'Create an order to sell a nft' })
  @ApiResponse({
    status: 200,
    type: CreateOrderResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async createNft(
    @Body() dto: CreateOrderForNftDto,
    @GetCurrentUserAddress() userAddress: string,
  ) {
    return this.orderService.createOrderForNft(userAddress, dto);
  }

  @Post('create/token')
  @ApiOperation({ summary: 'Create an order to sell a token' })
  @ApiResponse({
    status: 200,
    type: CreateOrderResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async createToken(
    @Body() dto: CreateOrderForTokenDto,
    @GetCurrentUserAddress() userAddress: string,
  ) {
    return this.orderService.createOrderForToken(userAddress, dto);
  }

  @Get('nft')
  @ApiOperation({ summary: 'Receive orders for nft' })
  @ApiResponse({
    status: 200,
    type: GetOrdersByNftsResponse,
  })
  @Public()
  async ordersByNft(@Query() dto: GetOrdersDto) {
    return this.orderService.getOrdersForNfts(dto);
  }

  @Get('token')
  @ApiOperation({ summary: 'Receive orders for the token' })
  @ApiResponse({
    status: 200,
    type: GetOrdersByTokensResponse,
  })
  @Public()
  async getOrdersByToken(@Query() dto: GetOrdersDto) {
    return this.orderService.getOrdersForTokens(dto);
  }

  @Get('token/details')
  @ApiOperation({ summary: 'Get token order details' })
  @ApiResponse({
    status: 200,
    type: GetTokenOrderDetailsResponse,
  })
  @Public()
  async getTokenOrderDetails(@Query() dto: GetTokenOrderDetailsDto) {
    return this.orderService.getTokenOrderDetails(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Receive orders for me' })
  @ApiResponse({
    status: 200,
    type: GetOrdersByMeResponse,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async getOrdersByMe(
    @GetCurrentUserAddress() userAddress: string,
    @Query() dto: GetOrdersForMeDto,
  ) {
    return this.orderService.getOrdersForMe(userAddress, dto);
  }

  @Post('edit')
  @ApiOperation({ summary: 'Edit order by id' })
  @ApiResponse({
    status: 200,
    type: EditResponse,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async editOrderById(
    @GetCurrentUserId() userId: string,
    @Body() dto: EditOrder,
  ) {
    return this.orderService.editOrderById(userId, dto);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel order by id' })
  @ApiResponse({
    status: 200,
    type: CancelOrderResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async cancelOrderById(
    @GetCurrentUserId() userId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.orderService.cancelOder(userId, dto);
  }

  @Get('created-by-me')
  @ApiOperation({ summary: 'Get orders created by me' })
  @ApiResponse({
    status: 200,
    type: GetOrdersCreatedByMeResponse,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async getOrdersCreatedByMe(
    @GetCurrentUserId() userId: string,
    @Query() dto: GetCreatedByMeDto,
  ) {
    return this.orderService.getCreatedByMe(userId, dto);
  }

  @Get('info')
  @ApiOperation({ summary: 'Get order info by orderId' })
  @ApiResponse({
    status: 200,
    type: GetOrderResponse,
  })
  @Public()
  async getOrderInfo(@Query() dto: GetOrderDto) {
    return this.orderService.getOrderInfo(dto);
  }
}
