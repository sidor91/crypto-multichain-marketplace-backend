import { ILike } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';

import { ETransactionStatus, OrderStatusType } from 'src/@enums';
import { Order } from 'src/order/entities/order.entity';
import { OrderService } from 'src/order/order.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { UserService } from 'src/user/user.service';

import { OrderEvent } from '../@types';
import { UtilsService } from '../utils.service';

@Injectable()
export class PurchaseService {
  private logger = new Logger(PurchaseService.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
    private readonly utilsService: UtilsService,
  ) {}

  async PurchaseOrder(chain_id: string, event: OrderEvent) {
    try {
      const { orderId } = event.returnValues;

      const existingOrder: Order = await this.orderService.findOne({
        order_id: ILike(orderId),
        chain_id,
      });

      const findTx: Transaction = await this.transactionService.findOne({
        tx_hash: ILike(event.transactionHash),
        chain_id,
      });

      if (existingOrder && findTx) {
        if (
          existingOrder.status === OrderStatusType.ACTIVE ||
          existingOrder.status === OrderStatusType.SOLD
        ) {
          return await this.purchaseOrderTx(event, findTx);
        }
        // TODO remove the return below if offer saving to db will fail
        return;
      } else {
        const tx = await this.utilsService.retryFind(event, 'transaction');
        if (tx instanceof Transaction) {
          return await this.purchaseOrderTx(event, tx);
        }
      }

      await this.createPurchaseOrderTx(chain_id, event, existingOrder);
    } catch (error) {
      this.handlePurchaseServiceError(event, error);
    }
  }

  private async purchaseOrderTx(event: OrderEvent, findTx: Transaction) {
    try {
      const updateTx = { status: ETransactionStatus.SUCCESS };
      await this.transactionService.update(findTx.id, updateTx);
    } catch (error) {
      this.handlePurchaseServiceError(event, error);
    }
  }

  private async createPurchaseOrderTx(
    chain_id: string,
    event: OrderEvent,
    existingOrder: Order,
  ) {
    try {
      const user = await this.userService.findOrCreate(
        event.returnValues.fill.fulfiller,
      );

      const createTx = {
        chain_id,
        tx_hash: event.transactionHash,
        amount: BigInt(event.returnValues.fill.tokensReceived),
        orderId: existingOrder.id,
        status: ETransactionStatus.SUCCESS,
      };

      await this.transactionService.createTransaction(user.id, createTx);
    } catch (error) {
      this.handlePurchaseServiceError(event, error);
    }
  }

  private handlePurchaseServiceError(event: OrderEvent, error: any) {
    this.logger.error('Event:', event.event);
    this.logger.error('Blocknumber:', event.blockNumber);
    this.logger.error('Service error:', error);
  }
}
