import { NULL_ADDRESS } from 'src/@constants';

import { TokenProperty, Tokens } from '../type';

import {
  isDevEnv,
  mainnetChains,
  MainnetChainValue,
  testnetChains,
  TestnetChainValue,
} from './chains';

const mainnetTokens: Record<MainnetChainValue, TokenProperty> = {
  [mainnetChains.BINANCE_MAINNET_CHAIN_ID]: {
    lina_token: {
      address: '0x762539b45A1dCcE3D36d080F74d1AED37844b878',
      name: 'Linear Token',
      symbol: 'LINA',
      decimals: 18,
    },
    pay_token: {
      address: '0x55d398326f99059fF775485246999027B3197955',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 18,
    },
    native_token: {
      address: NULL_ADDRESS,
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  [mainnetChains.ETHEREUM_MAINNET_CHAIN_ID]: {
    lina_token: {
      address: '0x3E9BC21C9b189C09dF3eF1B824798658d5011937',
      name: 'Linear Token',
      symbol: 'LINA',
      decimals: 18,
    },
    pay_token: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
    },
    native_token: {
      address: NULL_ADDRESS,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

const testnetTokens: Record<TestnetChainValue, TokenProperty> = {
  [testnetChains.BINANCE_TESTNET_CHAIN_ID]: {
    lina_token: {
      address: '0xEF2dB7cEA5164B2cBeE93b85BA2E5a0304EeC9ef',
      name: 'Linear Token',
      symbol: 'LINA',
      decimals: 18,
    },
    pay_token: {
      address: '0x07eFe68d6ff38313b11446f52274b7b182437d96',
      name: 'United State Dolar Tether',
      symbol: 'USDT',
      decimals: 18,
    },
    native_token: {
      address: NULL_ADDRESS,
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  [testnetChains.ETHEREUM_TESTNET_CHAIN_ID]: {
    lina_token: {
      address: '0x5C425F279cED69810a81f05680d1b5B1f88b1AB6',
      name: 'Linear Token',
      symbol: 'LINA',
      decimals: 18,
    },
    pay_token: {
      address: '0xA1831AbfECC01d04d1474249Fd48d266a1242D81',
      name: 'United State Dolar Tether',
      symbol: 'USDT',
      decimals: 6,
    },
    native_token: {
      address: NULL_ADDRESS,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

export const tokens: Tokens = {
  ...mainnetTokens,
  ...(isDevEnv && testnetTokens),
};
