import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

import { DAY_IN_MS, HOUR_IN_MS, tokenCoinMarketCapRegex } from 'src/@constants';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';

import { CryptoData } from './interfaces';

@Injectable()
export class CoinMarketCapService {
  private logger = new Logger(CoinMarketCapService.name);

  constructor(
    private readonly multiChainDataService: MultiChainDataService,
    private readonly config: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const apiKey = this.config.get<string>('COINMARKETCAP_API_KEY');
    this.httpService.axiosRef.defaults.headers['X-CMC_PRO_API_KEY'] = apiKey;
  }

  private cleanSymbol(symbol: string) {
    return symbol.replace(tokenCoinMarketCapRegex, '');
  }

  async getRate(chainId: string): Promise<number> {
    const chainData = this.multiChainDataService.getChainData(chainId);
    const { native_token, pay_token } = chainData.tokens;
    const cacheKey = `getRate-${native_token.symbol}-${pay_token.symbol}`;
    try {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData || cachedData === 0) return Number(cachedData);
      const endpoint = `https://pro-api.coinmarketcap.com/v1/tools/price-conversion?symbol=${native_token.symbol}&amount=1&convert=${pay_token.symbol}`;
      const response = await firstValueFrom(this.httpService.get(endpoint));
      const { data } = response.data;
      const result = data?.quote[pay_token.symbol].price || 0;
      await this.cacheManager.set(cacheKey, result, HOUR_IN_MS);
      return Number(result);
    } catch (error) {
      this.logger.error(`getRate error: ${error.message}`);
      await this.cacheManager.set(cacheKey, 0, HOUR_IN_MS);
      return 0;
    }
  }

  async getCoinmarketCapTokenIdByAddress(
    tokenAddress: string,
    chainId: string,
  ): Promise<number> {
    const cacheKey = `getCoinmarketCapTokenIdByAddress-${chainId}-${tokenAddress}`;
    try {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData || cachedData === 0) return Number(cachedData);
      const endpoint = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?address=${tokenAddress}`;
      const { data }: { data: CryptoData } = await firstValueFrom(
        this.httpService.get(endpoint),
      );
      if (!data.data) {
        throw new Error(
          `The CoinmarketCap data for ${tokenAddress} wasn't found`,
        );
      }
      const id = Object.values(data.data)[0]?.id || 0;
      await this.cacheManager.set(cacheKey, id, DAY_IN_MS);
      return id;
    } catch (error) {
      if (error.response && error.response.status !== 400) {
        this.logger.error(`getCoinmarketCapTokenIdByAddress error: ${error}`);
      }
      await this.cacheManager.set(cacheKey, 0, DAY_IN_MS);
      return 0;
    }
  }

  async getRateByTokenIds(
    coinmarketcap_id: number,
    convert_coinmarketcap_id: number,
  ): Promise<number | null> {
    if (coinmarketcap_id === 0) {
      return null;
    }
    const cacheKey = `getRateByTokenIds-${coinmarketcap_id}-${convert_coinmarketcap_id}`;
    try {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData || cachedData === 0) return Number(cachedData);
      const endpoint = `https://pro-api.coinmarketcap.com/v2/tools/price-conversion?id=${coinmarketcap_id}&amount=1&convert_id=${convert_coinmarketcap_id}`;
      const response = await firstValueFrom(this.httpService.get(endpoint));
      const { data } = response.data;
      const result = data?.quote[convert_coinmarketcap_id].price || 0;
      await this.cacheManager.set(cacheKey, result, HOUR_IN_MS);
      return result;
    } catch (error) {
      this.logger.error(`getRateByTokenIds error: ${error.message}`);
      await this.cacheManager.set(cacheKey, 0, HOUR_IN_MS);
      return 0;
    }
  }

  // TODO: Get rid on searching by symbol
  // TODO: Rewrite this serivce for multichain
  async getTokenDetailsByMarket(tokenSymbol: string, chainId: string) {
    const cacheKey = `getTokenDetailsByMarket-${chainId}-${tokenSymbol}`;
    const noDataForSymbolErrorMessage = 'No data found for symbol';
    try {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) return cachedData;

      const endpoint = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${tokenSymbol}`;
      const response = await firstValueFrom(this.httpService.get(endpoint));
      const { data } = response.data;

      const tokenInfoArray = data[tokenSymbol];

      if (!tokenInfoArray)
        throw new Error(`No data found for symbol ${tokenSymbol}`);

      const cleanedSymbol = this.cleanSymbol(tokenSymbol);

      const tokenToFind = tokenInfoArray.find(
        (t) =>
          t.symbol === cleanedSymbol.toUpperCase() &&
          t.tags &&
          t.tags.some((tag) =>
            [
              'binance-labs-portfolio',
              'defi',
              'platform',
              'bnb-chain',
              'binance-chain',
              'payments',
            ].includes(tag.slug),
          ),
      );

      if (!tokenToFind)
        throw new Error(
          `The token with the symbol ${tokenSymbol} doesn't seem to belong to the BNB chain.`,
        );

      const { total_supply = null, circulating_supply = null } = tokenToFind;
      const { market_cap = null } = tokenToFind.quote.USD;

      const result = { total_supply, circulating_supply, market_cap };
      await this.cacheManager.set(cacheKey, result, HOUR_IN_MS);
      return result;
    } catch (error) {
      if (!error.message.includes(noDataForSymbolErrorMessage)) {
        this.logger.error(`getTokenDetails error: ${error.message}`);
      }
      await this.cacheManager.set(
        cacheKey,
        { total_supply: null, circulating_supply: null, market_cap: null },
        HOUR_IN_MS,
      );
      return { total_supply: null, circulating_supply: null, market_cap: null };
    }
  }

  // FOR TESTNET USIGN ONLY
  public async getTokenMarketPriceBySymbol(
    symbol: string,
    chainId: string,
  ): Promise<number> {
    const cacheKey = `getTokenDetailsByMarket-${chainId}-${symbol}`;
    try {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) return Number(cachedData);

      const endpoint = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}`;
      const { data } = await firstValueFrom(this.httpService.get(endpoint));
      let marketPrice: number = 0;

      if (data.data && data.data[symbol])
        marketPrice = data.data[symbol][0]?.quote['USD']?.price;
      await this.cacheManager.set(cacheKey, marketPrice, HOUR_IN_MS);
      return marketPrice;
    } catch (error) {
      await this.cacheManager.set(cacheKey, 0, HOUR_IN_MS);
      return 0;
    }
  }
}
