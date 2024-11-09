import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { ChainData } from 'src/@config/multichainConfig/type';

import { MultiChainDataService } from '../multichain-data.service';
import { ApiHandlerInterface } from '../types';

@Injectable()
export class BinanceTestNetApiHandler implements ApiHandlerInterface {
  constructor(
    private readonly multiChainDataService: MultiChainDataService,
    private readonly httpService: HttpService,
  ) {}

  public getHandlerName() {
    return BinanceTestNetApiHandler.name;
  }

  public async getTokenCirculatingSupply(
    chainId: string,
    options: { address: string },
  ): Promise<any> {
    const chainData: ChainData =
      this.multiChainDataService.getChainData(chainId);
    const { api_endpoint, api_key } = chainData.network;
    const { data } = await lastValueFrom(
      this.httpService.get(
        `${api_endpoint}?module=stats&action=tokenCsupply&contractaddress=${options.address}&apikey=${api_key}`,
      ),
    );
    return data.result;
  }

  public async getAbi(
    chainId: string,
    options: { address: string },
  ): Promise<any> {
    const chainData: ChainData =
      this.multiChainDataService.getChainData(chainId);
    const { api_endpoint, api_key } = chainData.network;
    const { data } = await lastValueFrom(
      this.httpService.get(
        `${api_endpoint}?module=contract&action=getabi&address=${options.address}&apikey=${api_key}`,
      ),
    );
    if (data.status !== '1') {
      throw new Error(`Failed to fetch ABI: ${data.message}`);
    }

    return JSON.parse(data.result);
  }

  public async getTransactionsByAddress(
    chainId: string,
    options: { address: string; startBlock: number; endBlock: number },
  ) {
    const chainData: ChainData =
      this.multiChainDataService.getChainData(chainId);
    const { api_endpoint, api_key } = chainData.network;
    const { address, startBlock, endBlock } = options;
    const { data } = await lastValueFrom(
      this.httpService.get(
        `${api_endpoint}?module=account&action=txlist&address=${address}&startBlock=${startBlock}&endBlock=${endBlock}&apikey=${api_key}`,
      ),
    );
    return Array.isArray(data.result) ? data.result : [];
  }

  public async getInternalTransactionsByTxHash(
    chainId: string,
    options: { internalTxHash: string },
  ) {
    const chainData: ChainData =
      this.multiChainDataService.getChainData(chainId);
    const { api_endpoint, api_key } = chainData.network;
    const { data } = await lastValueFrom(
      this.httpService.get(
        `${api_endpoint}?module=account&action=txlistinternal&txhash=${options.internalTxHash}&apikey=${api_key}`,
      ),
    );
    return Array.isArray(data.result) ? data.result : [];
  }
}
