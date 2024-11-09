import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ELinearEventsType } from 'src/@enums';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';
import { SablierService } from 'src/sablier/sablier.service';
import { sleep } from 'src/utils';

import { EventsService } from './services/events.service';

@Injectable()
export class ListenerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ListenerService.name);
  private readonly subscriptionDelay: number;

  constructor(
    private readonly config: ConfigService,
    private readonly eventsService: EventsService,
    private readonly sablierService: SablierService,
    private readonly multiChainDataService: MultiChainDataService,
  ) {
    this.subscriptionDelay = this.config.get('SUBSCRIPTION_DELAY') || 5000;
  }

  async onApplicationBootstrap() {
    await this.sablierService.start();
    const availableChains = this.multiChainDataService.getAvailableChains();
    for (const chainId of availableChains) {
      this.start(chainId);
      await sleep(2000);
    }
  }

  async start(chainId: string) {
    while (true) {
      try {
        this.logger.debug(`[CHAIN_ID: ${chainId}]: Check events is started`);

        await this.eventsService.checkEvents(
          chainId,
          ELinearEventsType.CREATE_ORDER,
        );
        await this.eventsService.checkEvents(
          chainId,
          ELinearEventsType.BUY_ORDER,
        );
        await this.eventsService.checkEvents(
          chainId,
          ELinearEventsType.SETTLED_TOKEN,
        );
        await this.eventsService.checkEvents(
          chainId,
          ELinearEventsType.UPDATE_PRICE,
        );
        this.logger.debug(`[CHAIN_ID: ${chainId}]: Check events is finished`);
      } catch (error) {
        this.logger.error('There was an error during check events:', error);
      } finally {
        await sleep(this.subscriptionDelay);
      }
    }
  }
}
