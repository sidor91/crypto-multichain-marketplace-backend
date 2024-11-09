import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetCurrentUserId, Public } from 'src/@common/decorators';
import { AtGuard } from 'src/@common/guards';

import {
  CreateTransactionDTO,
  CreateTransactionResponse,
} from './dto/create-transaction.dto';
import {
  GetTransactionsFilledByMeDto,
  GetTransactionsFilledByMeResponse,
} from './dto/filled-by-me.dto';
import {
  GetAllTransactionsResponse,
  GetMyTransactionsResponse,
} from './dto/get-transactions.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction API')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
    status: 200,
    type: GetAllTransactionsResponse,
  })
  @Public()
  async getAllTransactions(@Query('chainId') chainId: string) {
    return this.transactionService.getTransactions(chainId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my transactions' })
  @ApiResponse({
    status: 200,
    type: GetAllTransactionsResponse,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async getAllTransactionsByUser(
    @GetCurrentUserId() userId: string,
    @Query('chainId') chainId: string,
  ) {
    return this.transactionService.getTransactionsByUser(userId, chainId);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create buy transaction' })
  @ApiResponse({
    status: 200,
    type: CreateTransactionResponse,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async createTransaction(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateTransactionDTO,
  ) {
    return this.transactionService.createTransaction(userId, dto);
  }

  @Get('filled-by-me')
  @ApiOperation({ summary: 'Get transactions filled by me' })
  @ApiResponse({
    status: 200,
    type: GetTransactionsFilledByMeResponse,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async getTransactionsFilledByMe(
    @GetCurrentUserId() userId: string,
    @Query() dto: GetTransactionsFilledByMeDto,
  ) {
    return this.transactionService.getFilledByMe(userId, dto);
  }

  @Get('list/:orderId')
  @ApiOperation({ summary: 'Get all transactions by order id (history)' })
  @ApiResponse({
    status: 200,
    // type: GetMyTransactionsResponse,
  })
  @Public()
  async listTransactionsByOrder(@Param('orderId') orderId: string) {
    return this.transactionService.findAll({ order: { id: orderId } });
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get my transactions by order id' })
  @ApiResponse({
    status: 200,
    type: GetMyTransactionsResponse,
  })
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  async getAllUserTransactionsByOrder(
    @GetCurrentUserId() userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.transactionService.getTransactionsByUserAndOrder(
      userId,
      orderId,
    );
  }
}
