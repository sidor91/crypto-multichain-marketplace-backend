import { Logger } from 'src/@types';

export const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
export const tokenCoinMarketCapRegex = /[^a-zA-Z0-9]/g;
export const bigintRegex = '^[1-9]\\d*$';

export const SEC_IN_MS = 1000;
export const MINUTE_IN_MS = SEC_IN_MS * 60;
export const HOUR_IN_MS = MINUTE_IN_MS * 60;
export const DAY_IN_MS = HOUR_IN_MS * 24;
export const DAY_IN_SEC = DAY_IN_MS / 1000;
export const YEAR_IN_MS = DAY_IN_MS * 365;

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const productionLogLevel: Logger[] = [
  'error',
  'warn',
  'fatal',
  'verbose',
];
