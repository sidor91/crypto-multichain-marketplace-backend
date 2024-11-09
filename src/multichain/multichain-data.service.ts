import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ApiHandlers,
  ChainData,
  ChainNumberUnionType,
  MultiChainData,
} from 'src/@config/multichainConfig/type';

@Injectable()
export class MultiChainDataService {
  private readonly multiChainData: MultiChainData;
  private readonly availableChains: ChainNumberUnionType[];
  private readonly apiHandlers: ApiHandlers;

  constructor(private readonly configService: ConfigService) {
    this.multiChainData = this.configService.getOrThrow('multiChainData');
    this.availableChains = this.configService.getOrThrow('availableChains');
    this.apiHandlers = this.configService.getOrThrow('apiHandlers');
  }

  public getChainData(chainId: string): ChainData {
    const validChain = this.validateChainId(chainId);
    const chainData = this.multiChainData.get(validChain);
    if (!chainData)
      throw new Error(`The chain data for chain id ${chainId} wasn't found`);
    return chainData;
  }

  public validateChainId(chainId: string) {
    const validChainId = this.availableChains.find(
      (chain) => chain === chainId,
    );
    if (!validChainId) throw new Error(`Chain id ${chainId} is not valid`);
    return validChainId;
  }

  public getAvailableChains() {
    return this.availableChains;
  }

  public getApiHandlers() {
    return this.apiHandlers;
  }
}
