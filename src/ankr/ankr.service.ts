import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

import { DAY_IN_MS } from 'src/@constants';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';

import { ankrApiBlockchainName } from '../@config/multichainConfig/data/ankr';

@Injectable()
export class AnkrService {
  private logger = new Logger(AnkrService.name);

  constructor(
    private readonly multiChainDataService: MultiChainDataService,
    private readonly config: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getHolders(chain_id: string, contractAddress: string) {
    const chainData = this.multiChainDataService.getChainData(chain_id);
    const blockchain = ankrApiBlockchainName[chainData.chain_id];
    const cacheKey = `getHolders-${contractAddress}`;
    try {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData || cachedData === 0) return cachedData;

      const apiKey = this.config.get<string>('ANKR_API_KEY');
      const endpoint = `https://rpc.ankr.com/multichain/${apiKey}`;
      const body = {
        id: 1,
        jsonrpc: '2.0',
        method: 'ankr_getTokenHoldersCount',
        params: {
          blockchain,
          contractAddress,
          pageSize: 1,
          pageToken: '',
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(endpoint, body),
      );
      const { data } = response;
      const result = data?.result?.latestHoldersCount || 0;
      await this.cacheManager.set(cacheKey, result, DAY_IN_MS);
      return result;
    } catch (error) {
      this.logger.error(`getHolders error: ${error.message}`);
      await this.cacheManager.set(cacheKey, 0, DAY_IN_MS);
      return 0;
    }
  }
}
