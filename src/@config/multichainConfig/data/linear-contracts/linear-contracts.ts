import { LinearContractProperty, LinearContracts } from '../../type';
import {
  isDevEnv,
  mainnetChains,
  MainnetChainValue,
  testnetChains,
  TestnetChainValue,
} from '../chains';

import * as binanceMainnetLinearAbi from './abi/binance-mainnet-linear.json';
import * as binanceTestnetLinearAbi from './abi/binance-testnet-linear.json';
import * as ethereumMainnetLinearAbi from './abi/ethereum-mainnet-linear.json';
import * as ethereumTestnetLinearAbi from './abi/ethereum-testnet-linear.json';

const mainnetContracts: Record<MainnetChainValue, LinearContractProperty> = {
  [mainnetChains.BINANCE_MAINNET_CHAIN_ID]: {
    address: '0xd56AB39CFa084ae85d924352CB928D32C9F3f4A3',
    abi: binanceMainnetLinearAbi,
    start_block: 43505397,
  },
  [mainnetChains.ETHEREUM_MAINNET_CHAIN_ID]: {
    address: '0xAB89AEB0b3e39d58041Ef27C8f45Be8A3F7206F5',
    abi: ethereumMainnetLinearAbi,
    start_block: 20992660,
  },
};

const testnetContracts: Record<TestnetChainValue, LinearContractProperty> = {
  [testnetChains.BINANCE_TESTNET_CHAIN_ID]: {
    address: '0x9E6AaFbd445ce92Fafa2d4E8Bc545BF6F3BC6bC9',
    abi: binanceTestnetLinearAbi,
    start_block: 44562093,
  },
  [testnetChains.ETHEREUM_TESTNET_CHAIN_ID]: {
    address: '0x3920BC35c3afA2EF95268F9ACc0A84e750484f1A',
    abi: ethereumTestnetLinearAbi,
    start_block: 6941290,
  },
};

export const linearContracts: LinearContracts = {
  ...mainnetContracts,
  ...(isDevEnv && testnetContracts),
};
