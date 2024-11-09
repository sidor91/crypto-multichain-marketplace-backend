import { Repository } from 'typeorm';

import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { GetUserInfoDTO } from 'src/@common/dto/get-user-info.dto';
import { GetTokenDetailsDto } from 'src/@common/dto/token-details.dto';
import { HOUR_IN_MS } from 'src/@constants';
import * as abiERC20 from 'src/@constants/abis/ERC20.json';
import { TMoralisUserTokens, TTokenDetails } from 'src/@types';
import { AnkrService } from 'src/ankr/ankr.service';
import { CoinMarketCapService } from 'src/coinmarketcap/coinmarketcap.service';
import { MoralisService } from 'src/moralis/moralis.service';
import { MultiChainApiService } from 'src/multichain/multichain-api.service';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';
import { FilterSortService } from 'src/sortingAndFiltering/filter-sort.service';
import { formatUnits } from 'src/utils';
import { Web3Service } from 'src/web3/web3.service';

import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Token } from './entities/token.entity';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly ankrService: AnkrService,
    private readonly moralisService: MoralisService,
    private readonly filterSortService: FilterSortService,
    private readonly coinMarketCapService: CoinMarketCapService,
    private readonly web3Service: Web3Service,
    private readonly multiChainApiService: MultiChainApiService,
    private readonly multiChainDataService: MultiChainDataService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateTokenDto) {
    return await this.tokenRepository.save(dto);
  }

  async findAll(request = {}) {
    return await this.tokenRepository.find({ where: request });
  }

  async findOne(request = {}) {
    return await this.tokenRepository.findOne({
      where: request,
    });
  }

  async updateToken(id: string, dto: UpdateTokenDto) {
    return await this.tokenRepository.update({ id }, dto);
  }

  async getTokenDetails(dto: GetTokenDetailsDto) {
    const { token_address, chainId } = dto;

    const cacheKey = `${token_address}-${chainId}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData)
      return {
        success: true,
        data: cachedData,
      };
    const tokenDecimals = await this.web3Service.getTokenDecimals(
      chainId,
      abiERC20,
      token_address,
    );

    let totalSupplyFromContract: number | null = null;
    let circulatingSupplyFromContract: number | null = null;

    try {
      const { total_supply, circulating_supply, market_cap } =
        (await this.coinMarketCapService.getTokenDetailsByMarket(
          dto.symbol,
          chainId,
        )) as TTokenDetails;

      if (total_supply === null) {
        const totalSupply = await this.web3Service.getTotalSupply(
          chainId,
          abiERC20,
          token_address,
        );
        totalSupplyFromContract = formatUnits(totalSupply, tokenDecimals);
      } else {
        totalSupplyFromContract = total_supply;
      }

      if (circulating_supply === null) {
        const data = await this.multiChainApiService.getTokenCirculatingSupply(
          chainId,
          { address: token_address },
        );

        circulatingSupplyFromContract = formatUnits(
          BigInt(data),
          tokenDecimals,
        );
      } else {
        circulatingSupplyFromContract = circulating_supply;
      }

      const transactions_count =
        await this.moralisService.getERC20TransactionsCount(dto);
      const token_holders = await this.ankrService.getHolders(
        chainId,
        token_address,
      );

      const tokenDetail = {
        total_supply: totalSupplyFromContract,
        market_cap,
        circulating_supply: circulatingSupplyFromContract,
        transactions_count,
        token_holders,
        token_address,
      };

      await this.cacheManager.set(cacheKey, tokenDetail, HOUR_IN_MS);
      return {
        success: true,
        data: tokenDetail,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getAllUserTokens(dto: GetUserInfoDTO) {
    try {
      const { sortBy, sortOrder, query, page, limit, chainId } = dto;
      const chainData = this.multiChainDataService.getChainData(chainId);
      const { isTestnet } = chainData.network;
      const userTokens =
        (await this.moralisService.getTokenBalancesByUserAddress(
          dto,
        )) as TMoralisUserTokens;

      const rate = await this.coinMarketCapService.getRate(chainId);
      const mappedUserTokens = [];

      for (const token of userTokens) {
        const {
          name,
          symbol,
          tokenAddress,
          logo,
          decimals,
          balance,
          usdValue,
        } = token;

        let checkedDecimals: number = Number(decimals);
        const human_amount = formatUnits(BigInt(balance), checkedDecimals);
        let price_usdt = usdValue ? usdValue : 0;
        const price_native = usdValue && rate ? usdValue / rate : 0;
        let token_market_price_usdt = usdValue ? usdValue / human_amount : 0;

        // FOR development only
        if (isTestnet) {
          token_market_price_usdt =
            await this.coinMarketCapService.getTokenMarketPriceBySymbol(
              symbol,
              chainId,
            );
          price_usdt = token_market_price_usdt * human_amount;
        }
        //

        if (typeof checkedDecimals !== 'number') {
          checkedDecimals = await this.web3Service.getTokenDecimals(
            chainId,
            abiERC20,
            tokenAddress._value,
          );
        }

        mappedUserTokens.push({
          name,
          symbol,
          token_address: tokenAddress,
          logo: logo || '',
          decimals: checkedDecimals,
          amount: balance,
          human_amount,
          price_usdt,
          price_native,
          token_market_price_usdt,
        });
      }

      const { data, totalElements } =
        this.filterSortService.applyFiltersForAssets(
          { sortBy, sortOrder, page, limit, query },
          mappedUserTokens,
        );

      return {
        success: true,
        data,
        totalElements,
        rate,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to token values',
      };
    }
  }
}
