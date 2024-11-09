import { ILike } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';

import { OrderStatusType } from 'src/@enums';
import { Order } from 'src/order/entities/order.entity';
import { OrderService } from 'src/order/order.service';
import { sleep } from 'src/utils';

import { OrderEvent } from '../@types';
import { UtilsService } from '../utils.service';

@Injectable()
export class UpdateService {
  private delay = 2000;
  private logger = new Logger(UpdateService.name);
  constructor(
    private readonly orderService: OrderService,
    private readonly utilsService: UtilsService,
  ) {}

  async updatePriceForOrder(chain_id: string, event: OrderEvent) {
    try {
      const { orderId } = event.returnValues;

      const existingOrder: Order = await this.orderService.findOne({
        order_id: ILike(orderId),
        status: OrderStatusType.ACTIVE,
        chain_id,
      });

      if (existingOrder && existingOrder.status === OrderStatusType.ACTIVE) {
        return await this.updatePrice(event, existingOrder);
      } else {
        const order = await this.findOrderWithNewPrice(event);
        if (order instanceof Order) {
          return await this.updatePrice(event, order);
        }
      }
    } catch (error) {
      this.handleServiceError(event, error);
    }
  }

  private async updatePrice(event: OrderEvent, existingOrder: Order) {
    try {
      const { offer_price, price_per_token } =
        await this.utilsService.calculateOfferPriceFromBlockchainEvent(
          event,
          existingOrder.chain_id,
        );

      await this.orderService.update(existingOrder.id, {
        price_per_token,
        offer_price,
      });
    } catch (error) {
      this.handleServiceError(event, error);
    }
  }

  private async findOrderWithNewPrice(
    event: OrderEvent,
    maxRetries: number = 5,
  ) {
    const { orderId } = event.returnValues;
    let entityFound = false;

    for (
      let retryCount = 0;
      retryCount < maxRetries && !entityFound;
      retryCount++
    ) {
      await sleep(this.delay);
      const existingEntity = await this.orderService.findOne({
        order_id: orderId,
        status: OrderStatusType.ACTIVE,
      });

      if (existingEntity) {
        entityFound = true;
        return existingEntity;
      }
    }

    return null;
  }

  private handleServiceError(event: OrderEvent, error: any) {
    this.logger.error('Event:', event.event);
    this.logger.error('Blocknumber:', event.blockNumber);
    this.logger.error('Service error:', error);
  }
}
