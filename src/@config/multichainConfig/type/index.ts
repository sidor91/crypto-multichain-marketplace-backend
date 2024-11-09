import { AbiItem } from 'web3';

import { ApiHandlerInterface } from 'src/multichain/types';

import { AVAILABLE_CHAINS } from '../data';

type ChainNumberKey = keyof typeof AVAILABLE_CHAINS;
export type ChainNumberValue = (typeof AVAILABLE_CHAINS)[ChainNumberKey];

export type ChainNumberUnionType = `${ChainNumberValue}`;

export type LinearContractProperty = {
  address: string;
  abi: AbiItem[];
  start_block: number;
};

export type LinearContracts = Record<
  ChainNumberUnionType,
  LinearContractProperty
>;

export type SablierInfoProperty = {
  deployer_address: string;
  start_block: number;
  method_id: string;
};

export type SablierInfo = Record<ChainNumberValue, SablierInfoProperty>;

type TokenPropertyName = 'lina_token' | 'pay_token' | 'native_token';

export type TokenProperty = Record<
  TokenPropertyName,
  {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  }
>;

export type Tokens = Record<ChainNumberValue, TokenProperty>;

export type NetworkProperty = {
  name: string;
  symbol: string;
  rpc: string;
  alt_rpc: string;
  api_endpoint: string;
  api_key: string;
  batchSize: number;
  isTestnet: boolean;
};

export type Networks = Record<ChainNumberValue, NetworkProperty>;

export type ChainData = {
  chain_id: ChainNumberUnionType;
  linear_contract: LinearContractProperty;
  network: NetworkProperty;
  tokens: TokenProperty;
  sablierInfo: SablierInfoProperty;
};

export type ApiHandlerProperty = new (...args: any[]) => ApiHandlerInterface;

export type ApiHandlers = Record<ChainNumberValue, ApiHandlerProperty>;

export type MultiChainData = Map<ChainNumberUnionType, ChainData>;

export type AnkrApiBlockchainNameType = Record<ChainNumberUnionType, string>;
