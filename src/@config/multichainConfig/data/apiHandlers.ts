import { BinanceMainNetApiHandler } from 'src/multichain/apiHandlers/binance-mainnet.api.handler';
import { BinanceTestNetApiHandler } from 'src/multichain/apiHandlers/binance-testnet.api.handler';
import { EthereumMainNetApiHandler } from 'src/multichain/apiHandlers/ethereum-mainnet.api.handler';
import { EthereumTestNetApiHandler } from 'src/multichain/apiHandlers/ethereum-testnet.api.handler';

import { ApiHandlerProperty, ApiHandlers } from '../type';

import {
  isDevEnv,
  mainnetChains,
  MainnetChainValue,
  testnetChains,
  TestnetChainValue,
} from './chains';

const mainnetApiHandlers: Record<MainnetChainValue, ApiHandlerProperty> = {
  [mainnetChains.BINANCE_MAINNET_CHAIN_ID]: BinanceMainNetApiHandler,
  [mainnetChains.ETHEREUM_MAINNET_CHAIN_ID]: EthereumMainNetApiHandler,
};

const testnetApiHandlers: Record<TestnetChainValue, ApiHandlerProperty> = {
  [testnetChains.BINANCE_TESTNET_CHAIN_ID]: BinanceTestNetApiHandler,
  [testnetChains.ETHEREUM_TESTNET_CHAIN_ID]: EthereumTestNetApiHandler,
};

export const apiHandlers: ApiHandlers = {
  ...mainnetApiHandlers,
  ...(isDevEnv && testnetApiHandlers),
};
