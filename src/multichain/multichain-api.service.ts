import { Inject, Injectable, Logger } from '@nestjs/common';

import { ApiHandlerInterface, ApiServiceInterface } from './types';

@Injectable()
export class MultiChainApiService implements ApiServiceInterface {
  apiHandlers: Record<string, ApiHandlerInterface>;
  private readonly logger: Logger = new Logger(MultiChainApiService.name);

  constructor(
    @Inject('API_HANDLERS')
    apiHandlers: Record<string, ApiHandlerInterface>,
  ) {
    this.apiHandlers = apiHandlers;
  }

  public async getTokenCirculatingSupply(
    chainId: string,
    options: { address: string },
  ): Promise<string> {
    const { handler, handlerName } = this.getHandler(chainId);
    try {
      return await handler.getTokenCirculatingSupply(chainId, options);
    } catch (error) {
      this.logger.warn(`${handlerName} error: ${error.message}`);
      return '0';
    }
  }

  public async getAbi(chainId: string, options: { address: string }) {
    const { handler, handlerName } = this.getHandler(chainId);
    try {
      return await handler.getAbi(chainId, options);
    } catch (error) {
      throw new Error(`${handlerName} error: ${error.message}`);
    }
  }

  public async getTransactionsByAddress(
    chainId: string,
    options: { address: string; startBlock: number; endBlock: number },
  ) {
    const { handler, handlerName } = this.getHandler(chainId);
    try {
      return await handler.getTransactionsByAddress(chainId, options);
    } catch (error) {
      throw new Error(`${handlerName} error: ${error.message}`);
    }
  }

  public async getInternalTransactionsByTxHash(
    chainId: string,
    options: { internalTxHash: string },
  ) {
    const { handler, handlerName } = this.getHandler(chainId);
    try {
      return await handler.getInternalTransactionsByTxHash(chainId, options);
    } catch (error) {
      throw new Error(`${handlerName} error: ${error.message}`);
    }
  }

  private getHandler(chainId: string) {
    const handler = this.apiHandlers[chainId];
    if (!handler) {
      throw new Error(`API handler not found for chainId: ${chainId}`);
    }
    return { handler, handlerName: handler.getHandlerName() };
  }
}
