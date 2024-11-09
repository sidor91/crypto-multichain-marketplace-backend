import { Injectable, Logger } from '@nestjs/common';

import { ELinearEventsType } from 'src/@enums';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';
import { StartBlockService } from 'src/start_block/start_block.service';
import { Web3Service } from 'src/web3/web3.service';

import { OrderEvent } from '../@types';
import { CreatingService } from '../logic/creating.service';
import { PurchaseService } from '../logic/purchase.service';
import { UpdateService } from '../logic/update.service';
import { WithdrawalService } from '../logic/withdrawal.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly web3Service: Web3Service,
    private readonly startBlockService: StartBlockService,
    private readonly creatingService: CreatingService,
    private readonly purchaseService: PurchaseService,
    private readonly updateService: UpdateService,
    private readonly withdrawalService: WithdrawalService,
    private readonly multiChainDataService: MultiChainDataService,
  ) {}

  async checkEvents(chainId: string, eventName: string) {
    try {
      const chainData = this.multiChainDataService.getChainData(chainId);
      const { abi, address, start_block } = chainData.linear_contract;
      const { batchSize } = chainData.network;
      const contract = this.web3Service.getContract(chainId, abi, address);

      const latestBlock = await this.web3Service.getLatestBlock(chainId);

      const startFromBlock = await this.startBlockService.findOrCreate(
        chainId,
        eventName,
        start_block || Number(latestBlock),
      );
      for (let idx = startFromBlock; idx < latestBlock; idx += batchSize) {
        const to =
          idx + batchSize > Number(latestBlock)
            ? Number(latestBlock)
            : idx + batchSize;
        const events = await this.web3Service.checkEvent(
          contract,
          eventName,
          idx,
          to,
        );

        if (events.length > 0) {
          await this.processContractEvents(chainId, events);
        }
        await this.startBlockService.update(chainId, eventName, to);
      }
      return await this.startBlockService.update(
        chainId,
        eventName,
        Number(latestBlock),
      );
    } catch (err) {
      return this.logger.error(`Error checking events: ${err}`);
    }
  }

  private async processContractEvents(
    chainId: string,
    contractEvents: OrderEvent[],
  ) {
    try {
      for (const event of contractEvents) {
        switch (event.event) {
          case ELinearEventsType.CREATE_ORDER:
            await this.creatingService.CreatedOrder(chainId, event);
            break;
          case ELinearEventsType.BUY_ORDER:
            await this.purchaseService.PurchaseOrder(chainId, event);
            break;
          case ELinearEventsType.SETTLED_TOKEN:
            await this.withdrawalService.WithdrawalTokenForOrder(
              chainId,
              event,
            );
            break;
          case ELinearEventsType.UPDATE_PRICE:
            await this.updateService.updatePriceForOrder(chainId, event);
            break;
        }
      }
    } catch (error) {
      return this.logger.error(`Error processing contract events: ${error}`);
    }
  }
}
