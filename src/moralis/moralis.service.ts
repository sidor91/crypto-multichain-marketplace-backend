import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import Moralis from 'moralis';

import { GetUserInfoDTO } from 'src/@common/dto/get-user-info.dto';
import { GetTokenDetailsDto } from 'src/@common/dto/token-details.dto';
import { DAY_IN_MS } from 'src/@constants';
import { TMoralisNFTMetadata } from 'src/@types';
import { extractPathWithIpfs, sleep } from 'src/utils';

import {
  GetContractERC20MetadataDTO,
  GetNFTMetadataDTO,
  GetNFTsByUserDTO,
} from './dto/get-metadata.dto';

interface NftData {
  name?: string;
  description?: string;
  image?: string;
}

@Injectable()
export class MoralisService implements OnModuleInit {
  private logger = new Logger(MoralisService.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    Moralis.start({ apiKey: this.config.get('MORALIS_API_KEY') });
  }

  async getTokenBalancesByUserAddress(props: GetUserInfoDTO): Promise<any> {
    try {
      const { address, chainId } = props;

      // const cacheKey = `getTokenBalancesByUserAddress-${address}-${chainId}`;
      // const cachedData = await this.cacheManager.get(cacheKey);
      // if (cachedData) return cachedData;

      const tokensRawData =
        await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
          chain: chainId,
          address,
          excludeNative: true,
        });

      if (!tokensRawData) {
        throw new Error('Tokens data not found');
      }

      const result = tokensRawData.result;

      // await this.cacheManager.set(cacheKey, result, SEC_IN_MS * 10);
      return result;
    } catch (error) {
      this.logger.error(error.message);
      return [];
    }
  }

  async getAllNFTsByUserAddress(dto: GetNFTsByUserDTO): Promise<any> {
    try {
      const { chainId, userAddress } = dto;

      // const cacheKey = `getAllNFTsByUserAddress-${userAddress}-${chainId}`;
      // const cachedData = await this.cacheManager.get(cacheKey);
      // if (cachedData) return cachedData;

      const nftsRawData = await Moralis.EvmApi.nft.getWalletNFTs({
        chain: chainId,
        address: userAddress,
      });

      if (!nftsRawData.result) {
        throw new Error('NFTs is not found');
      }

      const filterResult = nftsRawData.result
        .map((nft) => {
          const nftData = nft.metadata as NftData | undefined;
          if (nft?.contractType === 'ERC1155') {
            return null;
          }

          return {
            contract_type: nft?.contractType || '',
            nft_name: nftData?.name || nft.name || '',
            nft_description: nftData?.description || '',
            nft_image: nftData?.image || '',
            token_id: nft?.tokenId || '',
            collection_address: nft?.tokenAddress || '',
            collection_name: nft?.name || '',
            collection_symbol: nft?.symbol || '',
            token_uri: nft?.tokenUri || '',
          };
        })
        .filter((nft) => nft !== null);

      // await this.cacheManager.set(cacheKey, filterResult, MINUTE_IN_MS);
      return filterResult;
    } catch (error) {
      this.logger.error(error.message);
      return [];
    }
  }

  async getERC20TokenContract(props: GetContractERC20MetadataDTO) {
    const { chainId, tokenAddresses } = props;

    const cacheKey = `getERC20TokenContract-${tokenAddresses}-${chainId}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const contractRawData = await Moralis.EvmApi.token.getTokenMetadata({
      chain: chainId,
      addresses: tokenAddresses,
    });

    if (!contractRawData.raw) throw new Error('Contract is not found');

    await this.cacheManager.set(cacheKey, contractRawData.raw, DAY_IN_MS);
    return contractRawData.raw;
  }

  async getNFTMetadata(props: GetNFTMetadataDTO) {
    const { tokenAddress, tokenId, chainId } = props;

    const cacheKey = `getNFTMetadata-${tokenAddress}-${chainId}-${tokenId}`;
    const cachedData: TMoralisNFTMetadata =
      await this.cacheManager.get(cacheKey);

    if (cachedData && cachedData.block_number_minted !== null)
      return cachedData;

    let retries = 3;
    let nftRawData = null;

    while (retries > 0) {
      nftRawData = await Moralis.EvmApi.nft.getNFTMetadata({
        chain: chainId,
        normalizeMetadata: true,
        mediaItems: false,
        address: tokenAddress,
        tokenId,
      });

      if (
        nftRawData &&
        nftRawData?.raw &&
        nftRawData?.raw?.normalized_metadata &&
        nftRawData?.raw?.block_number_minted !== null
      ) {
        break;
      }

      if (nftRawData?.raw?.block_number_minted === null) {
        await Moralis.EvmApi.nft.reSyncMetadata({
          chain: chainId,
          mode: 'async',
          address: tokenAddress,
          tokenId,
        });
      }

      retries--;

      if (retries > 0) await sleep(1000);
    }

    if (!nftRawData || !nftRawData?.raw) {
      throw new Error('NFT is not found');
    }

    const {
      minter_address,
      owner_of,
      token_id,
      contract_type,
      token_address,
      token_uri,
      symbol,
      normalized_metadata,
      block_number_minted,
    } = nftRawData.raw;

    const result = {
      contract_type,
      token_address,
      token_id,
      minter_address,
      owner_of,
      symbol,
      block_number_minted,
      token_uri: token_uri ? extractPathWithIpfs(token_uri) : '',
      nft: {
        name: normalized_metadata ? normalized_metadata.name : '',
        description: normalized_metadata ? normalized_metadata.description : '',
        image: normalized_metadata ? normalized_metadata.image : '',
      },
    };

    await this.cacheManager.set(cacheKey, result, DAY_IN_MS);
    return result;
  }

  async getERC20TransactionsCount(dto: GetTokenDetailsDto) {
    const { token_address, chainId } = dto;
    try {
      // const cacheKey = `getERC20TransactionsCount-${token_address}-${chainId}`;
      // const cachedData = await this.cacheManager.get(cacheKey);
      // if (cachedData) return cachedData;

      const response = await Moralis.EvmApi.token.getTokenStats({
        chain: chainId,
        address: token_address,
      });

      const result = Number(response?.raw?.transfers?.total) || null;
      // await this.cacheManager.set(cacheKey, result, MINUTE_IN_MS);
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
