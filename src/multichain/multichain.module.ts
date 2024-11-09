import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MultiChainApiService } from './multichain-api.service';
import { MultiChainDataService } from './multichain-data.service';
import { ApiHandlerInterface } from './types';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: 'API_HANDLERS',
      useFactory: (
        multiChainDataService: MultiChainDataService,
        httpService: HttpService,
      ) => {
        const apiHandlers = multiChainDataService.getApiHandlers();
        const handlers: Record<string, ApiHandlerInterface> = {};

        for (const key in apiHandlers) {
          const Handler = apiHandlers[key];
          handlers[key] = new Handler(multiChainDataService, httpService);
        }

        return handlers;
      },
      inject: [MultiChainDataService, HttpService],
    },
    MultiChainApiService,
    MultiChainDataService,
  ],
  exports: [MultiChainApiService, MultiChainDataService],
})
export class MultiChainModule {}
