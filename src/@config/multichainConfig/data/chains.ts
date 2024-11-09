import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const isDevEnv = process.env.IS_DEV_ENV;

type MainnetChains = {
  BINANCE_MAINNET_CHAIN_ID: '56';
  ETHEREUM_MAINNET_CHAIN_ID: '1';
};

export const mainnetChains: MainnetChains = {
  BINANCE_MAINNET_CHAIN_ID: '56',
  ETHEREUM_MAINNET_CHAIN_ID: '1',
};

type MainnetChainKey = keyof typeof mainnetChains;
export type MainnetChainValue = (typeof mainnetChains)[MainnetChainKey];

type TestnetChains = {
  BINANCE_TESTNET_CHAIN_ID: '97';
  ETHEREUM_TESTNET_CHAIN_ID: '11155111';
};

export const testnetChains: TestnetChains = {
  BINANCE_TESTNET_CHAIN_ID: '97',
  ETHEREUM_TESTNET_CHAIN_ID: '11155111',
};

type TestnetChainKey = keyof typeof testnetChains;
export type TestnetChainValue = (typeof testnetChains)[TestnetChainKey];

export const AVAILABLE_CHAINS = {
  ...mainnetChains,
  ...(isDevEnv && testnetChains),
};
