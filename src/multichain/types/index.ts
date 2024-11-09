import { AbiFragment } from 'web3';

import { InternalTx, NormalTx } from 'src/sablier/types';

export interface ApiServiceInterface {
  getTokenCirculatingSupply(
    chainId: string,
    options: { address: string },
  ): Promise<string>;
  getAbi(chainId: string, options: { address: string }): Promise<AbiFragment[]>;
  getTransactionsByAddress(
    chainId: string,
    options: { address: string; startBlock: number; endBlock: number },
  ): Promise<NormalTx[]>;
  getInternalTransactionsByTxHash(
    chainId: string,
    options: { internalTxHash: string },
  ): Promise<InternalTx[]>;
}
export interface ApiHandlerInterface extends ApiServiceInterface {
  getHandlerName(): string;
}
