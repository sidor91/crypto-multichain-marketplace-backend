import { ILike } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';

import * as ERC20abi from 'src/@constants/abis/ERC20.json';
import { OrderStatusType } from 'src/@enums';
import { TMoralisNFTMetadata } from 'src/@types';
import { MoralisService } from 'src/moralis/moralis.service';
import { Nft } from 'src/nft/entities/nft.entity';
import { NftService } from 'src/nft/nft.service';
import { Order } from 'src/order/entities/order.entity';
import { OrderService } from 'src/order/order.service';
import { SablierService } from 'src/sablier/sablier.service';
import { Token } from 'src/token/entities/token.entity';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { Web3Service } from 'src/web3/web3.service';

import { OrderEvent } from '../@types';
import { UtilsService } from '../utils.service';

@Injectable()
export class CreatingService {
  private logger = new Logger(CreatingService.name);

  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly tokenService: TokenService,
    private readonly nftService: NftService,
    private readonly moralisService: MoralisService,
    private readonly utilsService: UtilsService,
    private readonly web3Service: Web3Service,
    private readonly sablierService: SablierService,
  ) {}

  async CreatedOrder(chainId: string, event: OrderEvent) {
    try {
      const existingOrder: Order = await this.orderService.findOne({
        tx_hash: ILike(event.transactionHash),
        chain_id: chainId,
      });

      if (existingOrder) {
        if (existingOrder?.status === OrderStatusType.PENDING) {
          return await this.updateExistingOrderWithEventData(
            event,
            existingOrder,
          );
        }
        // TODO remove the return below if offer saving to db will fail
        return;
      } else {
        const order = await this.utilsService.retryFind(event, 'order');
        if (order instanceof Order) {
          return await this.updateExistingOrderWithEventData(event, order);
        }
      }

      await this.createOrderFromLinearContract(event, chainId);
    } catch (error) {
      this.handleCreateServiceError(event, error);
    }
  }

  private async updateExistingOrderWithEventData(
    event: OrderEvent,
    existingOrder: Order,
  ) {
    try {
      const { orderId, order } = event.returnValues;
      const { initialTokens, isNFT } = order;

      const { offer_price, price_per_token } =
        await this.utilsService.calculateOfferPriceFromBlockchainEvent(
          event,
          existingOrder.chain_id,
        );

      const updateData = {
        order_id: orderId,
        status: OrderStatusType.ACTIVE,
        amount: isNFT ? 1n : initialTokens,
        remain_amount: isNFT ? 1n : initialTokens,
        offer_price,
        price_per_token,
      };

      await this.orderService.update(existingOrder.id, updateData);
    } catch (error) {
      this.handleCreateServiceError(event, error);
    }
  }

  private async createOrderFromLinearContract(
    event: OrderEvent,
    chainId: string,
  ) {
    const { orderId, order } = event.returnValues;
    const transactionHash = event.transactionHash;

    try {
      const {
        tokenAddress,
        initialTokens,
        whitelistedAddress,
        partiallyFillable,
        requester,
        tokenId,
        isNFT,
      } = order;

      const user = await this.userService.findOrCreate(requester);

      let item: Token | Nft;
      if (!isNFT) {
        item = await this.getOrCreateToken(event, chainId, tokenAddress);
      } else {
        item = await this.getOrCreateNft(event, chainId, tokenAddress, tokenId);
      }

      const { offer_price, price_per_token } =
        await this.utilsService.calculateOfferPriceFromBlockchainEvent(
          event,
          chainId,
        );

      const createOrderData = {
        chain_id: chainId,
        order_id: orderId,
        offer_price,
        amount: isNFT ? 1n : initialTokens,
        remain_amount: isNFT ? 1n : initialTokens,
        whitelist: whitelistedAddress,
        is_crowd_fill: partiallyFillable,
        token: isNFT ? undefined : { id: item?.id },
        nft: isNFT ? { id: item?.id } : undefined,
        user: { id: user.id },
        description: (item as any)?.description || 'Crypto multichain marketpalce',
        tx_hash: transactionHash,
        price_per_token,
        status: OrderStatusType.ACTIVE,
      };

      await this.orderService.create(createOrderData);
    } catch (error) {
      this.handleCreateServiceError(event, error);
    }
  }

  private async getOrCreateToken(
    event: OrderEvent,
    chainId: string,
    tokenAddress: string,
  ): Promise<Token> {
    try {
      let token = await this.tokenService.findOne({ address: tokenAddress });
      if (!token) {
        const contractData = (
          await this.moralisService.getERC20TokenContract({
            chainId,
            tokenAddresses: [tokenAddress],
          })
        )[0];

        let decimals = Number(contractData.decimals);
        let symbol: string = contractData.symbol;
        let name: string = contractData.name;

        if (!decimals) {
          decimals = await this.web3Service.getTokenDecimals(
            chainId,
            ERC20abi,
            tokenAddress,
          );
        }
        if (!name) {
          name = await this.web3Service.getName(
            chainId,
            ERC20abi,
            tokenAddress,
          );
        }
        if (!symbol) {
          symbol = await this.web3Service.getSymbol(
            chainId,
            ERC20abi,
            tokenAddress,
          );
        }
        const createTokenDto = {
          chain_id: chainId,
          name,
          symbol,
          address: tokenAddress,
          image_url: contractData.logo || '',
          decimals,
          coinmarketcap_id: 0,
        };

        token = await this.tokenService.create(createTokenDto);
      }

      return token;
    } catch (error) {
      this.handleCreateServiceError(event, error);
    }
  }

  private async getOrCreateNft(
    event: OrderEvent,
    chainId: string,
    tokenAddress: string,
    tokenId: bigint,
  ) {
    try {
      const token_id = tokenId.toString();
      let nft = await this.nftService.findOne({
        address: tokenAddress.toLowerCase(),
        token_id,
        chain_id: chainId,
      });

      const getMetadataNFT = (await this.moralisService.getNFTMetadata({
        chainId,
        tokenAddress,
        tokenId: token_id,
      })) as TMoralisNFTMetadata;
      const description = getMetadataNFT?.nft?.description || '';
      const { requester } = event.returnValues.order;

      if (nft) {
        await this.nftService.updateNft(nft.id, {
          ipfs_url: getMetadataNFT.token_uri,
          name: getMetadataNFT.nft.name,
          image_url: getMetadataNFT.nft.image,
          owner: requester,
        });
      } else {
        const createNftDto = {
          chain_id: chainId,
          project_name: 'Crypto multichain marketpalce',
          ipfs_url: getMetadataNFT.token_uri,
          token_id,
          name: getMetadataNFT.nft.name,
          owner: requester,
          symbol: getMetadataNFT.symbol,
          image_url: getMetadataNFT.nft.image,
          address: tokenAddress.toLowerCase(),
        };

        const isSablierContract = await this.sablierService.findOne(
          tokenAddress,
          chainId,
        );

        if (isSablierContract) {
          nft = (
            await this.nftService.createSablierNft({
              collection_address: tokenAddress,
              token_id,
              chain_id: chainId,
              owner: requester,
            })
          ).newSablierNft;
        } else {
          nft = await this.nftService.create(createNftDto);
        }
      }

      return {
        ...nft,
        description,
      };
    } catch (error) {
      this.handleCreateServiceError(event, error);
    }
  }

  private handleCreateServiceError(event: OrderEvent, error: any) {
    this.logger.error('Event:', event.event);
    this.logger.error('Blocknumber:', event.blockNumber);
    this.logger.error('Service error:', error);
  }
}
