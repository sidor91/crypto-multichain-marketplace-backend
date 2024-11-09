import { AVAILABLE_CHAINS } from 'src/@config/multichainConfig/data';
import { AnkrApiBlockchainNameType } from 'src/@config/multichainConfig/type';

import { isDevEnv, MainnetChainValue, TestnetChainValue } from './chains';

const mainnetAnkrBlockchainNames: Record<MainnetChainValue, string> = {
  [AVAILABLE_CHAINS.BINANCE_MAINNET_CHAIN_ID]: 'bsc',
  [AVAILABLE_CHAINS.ETHEREUM_MAINNET_CHAIN_ID]: 'eth',
};

const testnetAnkrBlockchainNames: Record<TestnetChainValue, string> = {
  [AVAILABLE_CHAINS.BINANCE_TESTNET_CHAIN_ID]: 'bsc_testnet_chapel',
  [AVAILABLE_CHAINS.ETHEREUM_TESTNET_CHAIN_ID]: 'eth_sepolia',
};

export const ankrApiBlockchainName: AnkrApiBlockchainNameType = {
  ...mainnetAnkrBlockchainNames,
  ...(isDevEnv && testnetAnkrBlockchainNames),
};
