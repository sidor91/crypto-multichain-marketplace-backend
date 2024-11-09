import { Injectable } from '@nestjs/common';

import * as ERC20abi from 'src/@constants/abis/ERC20.json';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';
import { Order } from 'src/order/entities/order.entity';
import { OrderService } from 'src/order/order.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { sleep } from 'src/utils';
import { Web3Service } from 'src/web3/web3.service';

import { OrderEvent } from './@types';

@Injectable()
export class UtilsService {
  private delay = 2000;

  constructor(
    private readonly orderService: OrderService,
    private readonly transactionService: TransactionService,
    private readonly web3Service: Web3Service,
    private readonly multiChainDataService: MultiChainDataService,
  ) {}

  async retryFind(
    event: OrderEvent,
    serviceType: 'order' | 'transaction',
    maxRetries: number = 5,
  ): Promise<Transaction | Order> {
    const transactionHash = event.transactionHash;
    let entityFound = false;

    const service =
      serviceType === 'order' ? this.orderService : this.transactionService;

    for (
      let retryCount = 0;
      retryCount < maxRetries && !entityFound;
      retryCount++
    ) {
      await sleep(this.delay);
      const existingEntity = await service.findOne({
        tx_hash: transactionHash,
      });

      if (existingEntity) {
        entityFound = true;
        return existingEntity;
      }
    }

    return null;
  }

  public async calculateOfferPriceFromBlockchainEvent(
    event: OrderEvent,
    chainId: string,
  ) {
    const chainData = this.multiChainDataService.getChainData(chainId);

    const { order, newPrice } = event.returnValues;

    const {
      tokenAddress,
      initialTokens, // The initial number of tokens for sale (for NFT always 0)
      requestedTokenAmount, // Offer price (in USDT)
      pricePerToken, // The price of 1 USDT in tokens listed on offer
      partiallyFillable,
      isNFT,
    } = order;

    const offerPriceFromEvent = newPrice ? newPrice : requestedTokenAmount;

    const offer_token_decimals = isNFT
      ? 18
      : await this.web3Service.getTokenDecimals(
          chainData.chain_id,
          ERC20abi,
          tokenAddress,
        );
    const offer_token_precision = 10n ** BigInt(offer_token_decimals);
    const pay_token_decimals = chainData.tokens.pay_token.decimals;
    const pay_token_presicion = 10n ** BigInt(pay_token_decimals);

    const offer_price = newPrice
      ? newPrice
      : partiallyFillable
        ? (initialTokens * pay_token_presicion) / pricePerToken
        : requestedTokenAmount;

    const price_per_token = isNFT
      ? offerPriceFromEvent
      : partiallyFillable
        ? (1n * pay_token_presicion * offer_token_precision) / pricePerToken
        : (offerPriceFromEvent * offer_token_precision) / initialTokens;

    return { offer_price, price_per_token };
  }
}
