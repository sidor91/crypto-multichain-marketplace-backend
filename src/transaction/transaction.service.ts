import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EOrderType, ETransactionStatus } from 'src/@enums';
import { CoinMarketCapService } from 'src/coinmarketcap/coinmarketcap.service';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';
import { OrderService } from 'src/order/order.service';
import { OrderProperty } from 'src/sortingAndFiltering/dto/types';
import { FilterSortService } from 'src/sortingAndFiltering/filter-sort.service';
import { UserService } from 'src/user/user.service';
import { formatUnits } from 'src/utils';
import { VestingService } from 'src/vesting/vesting.service';

import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { GetTransactionsFilledByMeDto } from './dto/filled-by-me.dto';
import { UpdateTransactionDTO } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly filterSortService: FilterSortService,
    private readonly coinMarketCapService: CoinMarketCapService,
    private readonly vestingService: VestingService,
    private readonly multiChainDataService: MultiChainDataService,
  ) {}

  private async create(dto: Transaction) {
    return await this.transactionRepository.save(dto);
  }

  async update(id: string, dto: UpdateTransactionDTO) {
    return await this.transactionRepository.update({ id }, dto);
  }

  public async createTransaction(userId: string, dto: CreateTransactionDTO) {
    try {
      const { orderId, amount, tx_hash, chain_id } = dto;
      const user = await this.userService.findOne({ id: userId });
      if (!user)
        throw new Error(
          `createTransaction error: No user with id ${userId} in DB`,
        );
      const status = dto.status || ETransactionStatus.PENDING;
      const updatedOrder = await this.orderService.updateOrderAmount({
        orderId,
        amount: BigInt(amount),
        status,
      });

      const transactionData = {
        order: updatedOrder,
        chain_id,
        user,
        amount: BigInt(amount),
        payment_date: new Date(),
        status,
        tx_hash,
      };
      await this.create(transactionData);
      return {
        success: true,
        message: 'Transaction successfully created in th DB',
      };
    } catch (error) {
      return {
        success: false,
        message: `Transaction creation error: ${error.message}`,
      };
    }
  }

  async findAll(request = {}) {
    return await this.transactionRepository.find({
      where: request,
      relations: ['order', 'user'],
    });
  }

  async findOne(request = {}) {
    return await this.transactionRepository.findOne({
      where: request,
    });
  }

  async getTransactions(chain_id: string) {
    const getAll = await this.findAll({ chain_id });

    return {
      success: true,
      data: getAll,
      totalElements: getAll.length,
    };
  }

  async getTransactionsByUser(userId: string, chain_id: string) {
    const transactions = await this.transactionRepository.find({
      relations: ['order', 'user'],
      where: { chain_id, user: { id: userId } },
    });

    return {
      success: true,
      data: transactions,
      totalElements: transactions.length,
    };
  }

  async getTransactionsByUserAndOrder(userId: string, orderId: string) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId }, order: { id: orderId } },
      relations: ['order', 'user'],
    });

    return {
      success: true,
      data: transactions,
      totalElements: transactions.length,
    };
  }

  async getFilledByMe(userId: string, dto: GetTransactionsFilledByMeDto) {
    const { chainId } = dto;
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transactions')
      .innerJoinAndSelect('transactions.order', 'order')
      .innerJoinAndSelect('transactions.user', 'user')
      .leftJoinAndSelect('order.nft', 'nft')
      .leftJoinAndSelect('order.token', 'token')
      .where('transactions.user.id = :userId', { userId })
      .andWhere('transactions.chain_id = :chainId', { chainId });

    const [transactions, totalElements]: [Transaction[], number] =
      await this.filterSortService
        .applyFiltersForOrders({
          queryBuilder,
          dto,
          orderProperty: OrderProperty.ME,
          isTransactions: true,
        })
        .getManyAndCount();

    const formattedTransactions = await Promise.all(
      transactions.map(
        async ({
          id,
          created_at,
          updated_at,
          tx_hash,
          payment_date,
          status,
          order,
          amount,
        }) => {
          const { nft, token, order_id, price_per_token, chain_id } = order;
          const isNft = !!nft;

          const chainData = this.multiChainDataService.getChainData(chain_id);
          const pay_token_decimals = chainData.tokens.pay_token.decimals;
          const orderType = isNft ? EOrderType.NFT : EOrderType.TOKEN;
          const price_usdt = formatUnits(
            price_per_token,
            isNft ? 18 : pay_token_decimals,
          );

          const nativeTokenRate =
            await this.coinMarketCapService.getRate(chainId);

          const price_native = price_usdt / nativeTokenRate;

          let vesting;
          if (isNft) {
            const { vestings } = await this.vestingService.findAllByNftAddress({
              chainId: chain_id,
              nft_wallet_address: nft.nft_wallet_address?.toLowerCase(),
              token_id: nft.token_id,
              token_address: nft.address,
            });
            vesting = vestings[0] || {
              unclaimed: 'No info',
              start_date: 'No info',
              end_date: 'No info',
              vesting_contract_address: null,
              vesting_remains: 'No info',
              vesting_duration: 'No info',
              symbol: 'No info',
              streaming_frequency: 'No info',
              claim_portal_url: 'No info',
            };
          }

          const human_amount = isNft
            ? Number(amount)
            : formatUnits(amount, token.decimals);

          return {
            id,
            chain_id: chainId,
            created_at,
            updated_at,
            tx_hash,
            payment_date,
            status,
            orderType,
            order_id,
            image_url: isNft ? nft.image_url : token.image_url || '',
            name: isNft ? nft.name : token.name || '',
            symbol: isNft ? nft.symbol : token.symbol || '',
            human_amount,
            price_usdt,
            price_native,
            vesting,
          };
        },
      ),
    );

    return {
      success: true,
      data: formattedTransactions,
      totalElements: totalElements,
    };
  }
}
