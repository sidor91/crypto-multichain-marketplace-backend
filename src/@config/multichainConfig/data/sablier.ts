import { SablierInfo, SablierInfoProperty } from '../type';

import {
  isDevEnv,
  mainnetChains,
  MainnetChainValue,
  testnetChains,
  TestnetChainValue,
} from './chains';

const mainnetSablierInfo: Record<MainnetChainValue, SablierInfoProperty> = {
  [mainnetChains.BINANCE_MAINNET_CHAIN_ID]: {
    deployer_address: '0xb1bef51ebca01eb12001a639bdbbff6eeca12b9f',
    start_block: 4913232,
    method_id: '0x43686169',
  },
  [mainnetChains.ETHEREUM_MAINNET_CHAIN_ID]: {
    deployer_address: '0xd427d37b5f6d33f7d42c4125979361e011ffbfd9',
    start_block: 17613126,
    method_id: '0x43686169',
  },
};

const testnetSablierInfo: Record<TestnetChainValue, SablierInfoProperty> = {
  [testnetChains.BINANCE_TESTNET_CHAIN_ID]: {
    deployer_address: '',
    start_block: 1,
    method_id: '',
  },
  [testnetChains.ETHEREUM_TESTNET_CHAIN_ID]: {
    deployer_address: '0xb1bef51ebca01eb12001a639bdbbff6eeca12b9f',
    start_block: 4913232,
    method_id: '0x43686169',
  },
};

export const sablierInfo: SablierInfo = {
  ...mainnetSablierInfo,
  ...(isDevEnv && testnetSablierInfo),
};
