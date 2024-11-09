import { NetworkProperty, Networks } from '../type';

import {
  isDevEnv,
  mainnetChains,
  MainnetChainValue,
  testnetChains,
  TestnetChainValue,
} from './chains';

const mainnetNetworks: Record<MainnetChainValue, NetworkProperty> = {
  [mainnetChains.BINANCE_MAINNET_CHAIN_ID]: {
    name: 'Binance Mainnet',
    symbol: 'BNB',
    rpc: process.env.BINANCE_MAINNET_RPC,
    alt_rpc: process.env.BINANCE_MAINNET_ALT_RPC,
    api_endpoint: 'https://api.bscscan.com/api',
    api_key: process.env.BSC_API_KEY || '',
    batchSize: 2000,
    isTestnet: false,
  },
  [mainnetChains.ETHEREUM_MAINNET_CHAIN_ID]: {
    name: 'Ethereum',
    symbol: 'ETH',
    rpc: process.env.ETHEREUM_MAINNET_RPC,
    alt_rpc: process.env.ETHEREUM_MAINNET_ALT_RPC,
    api_endpoint: 'https://api.etherscan.io/api',
    api_key: process.env.ETH_API_KEY || '',
    batchSize: 2000,
    isTestnet: false,
  },
};

const testnetNetworks: Record<TestnetChainValue, NetworkProperty> = {
  [testnetChains.BINANCE_TESTNET_CHAIN_ID]: {
    name: 'Binance Testnet',
    symbol: 'BNB',
    rpc: process.env.BINANCE_TESTNET_RPC,
    alt_rpc: process.env.BINANCE_TESTNET_ALT_RPC,
    api_endpoint: 'https://api-testnet.bscscan.com/api',
    api_key: process.env.BSC_API_KEY || '',
    batchSize: 2000,
    isTestnet: true,
  },
  [testnetChains.ETHEREUM_TESTNET_CHAIN_ID]: {
    name: 'Sepolia',
    symbol: 'ETH',
    rpc: process.env.ETHEREUM_TESTNET_RPC,
    alt_rpc: process.env.ETHEREUM_TESTNET_ALT_RPC,
    api_endpoint: 'https://api-sepolia.etherscan.io/api',
    api_key: process.env.ETH_API_KEY || '',
    batchSize: 2000,
    isTestnet: true,
  },
};

export const networks: Networks = {
  ...mainnetNetworks,
  ...(isDevEnv && testnetNetworks),
};
