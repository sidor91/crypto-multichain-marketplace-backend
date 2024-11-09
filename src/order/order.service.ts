import { ILike, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NULL_ADDRESS } from 'src/@constants';
import * as ERC20abi from 'src/@constants/abis/ERC20.json';
import { EOrderType, ETransactionStatus, OrderStatusType } from 'src/@enums';
import { TMoralisNFTMetadata } from 'src/@types';
import { CoinMarketCapService } from 'src/coinmarketcap/coinmarketcap.service';
import { CoinMarketCapTokenIds } from 'src/coinmarketcap/constants';
import { MoralisService } from 'src/moralis/moralis.service';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';
import { Nft } from 'src/nft/entities/nft.entity';
import { NftService } from 'src/nft/nft.service';
import { SablierService } from 'src/sablier/sablier.service';
import { OrderProperty } from 'src/sortingAndFiltering/dto/types';
import { FilterSortService } from 'src/sortingAndFiltering/filter-sort.service';
import { CreateTokenDto } from 'src/token/dto/create-token.dto';
import { TokenService } from 'src/token/token.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { UserService } from 'src/user/user.service';
import {
  extractAddressesFromLogs,
  formatUnits,
  roundToPrecision,
} from 'src/utils';
import { VestingService } from 'src/vesting/vesting.service';
import { Web3Service } from 'src/web3/web3.service';

import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  CreateOrderDto,
  CreateOrderForNftDto,
  CreateOrderForTokenDto,
} from './dto/create-order.dto';
import { EditOrder } from './dto/edit-order.dto';
import { GetCreatedByMeDto } from './dto/get-created-by-me.dto';
import { GetNftWalletAddressDto } from './dto/get-nft-wallet-address.dto';
import { GetOrderDto } from './dto/get-order.dto';
import {
  GetOrdersDto,
  GetOrdersForMeDto,
  GetTokenOrderDetailsDto,
} from './dto/get-orders.dto';
import {
  getOfferTokenPriceInUsdtAndNativeDto,
  getOfferTokenPriceInUsdtAndNativeResponse,
} from './dto/get-token-price-data.dto';
import { UpdateOrderAmountDto } from './dto/update-order-amount.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly nftService: NftService,
    private readonly tokenService: TokenService,
    private readonly moralisService: MoralisService,
    private readonly userService: UserService,
    private readonly filterSortService: FilterSortService,
    private readonly coinMarketCapService: CoinMarketCapService,
    private readonly web3Service: Web3Service,
    private readonly vestingService: VestingService,
    private readonly multiChainDataService: MultiChainDataService,
    private readonly sablierService: SablierService,
  ) {}

  async create(dto: CreateOrderDto) {
    return await this.orderRepository.save(dto);
  }

  async findAll(request = {}) {
    return await this.orderRepository.find({ where: request });
  }

  async findOne(request = {}) {
    return await this.orderRepository.findOne({
      where: request,
      relations: ['nft', 'token', 'user'],
    });
  }

  async update(id: string, dto: UpdateOrderDto) {
    return await this.orderRepository.update({ id }, dto);
  }

  async checkNftWalletAddress(dto: GetNftWalletAddressDto) {
    const { token_address, token_id, chain_id } = dto;
    const nftData = (await this.moralisService.getNFTMetadata({
      tokenAddress: token_address,
      tokenId: token_id,
      chainId: chain_id,
    })) as TMoralisNFTMetadata;

    const events = await this.web3Service.getEventsByBlock(
      dto.chain_id,
      Number(nftData.block_number_minted),
      nftData.minter_address,
    );
    const addresses = extractAddressesFromLogs(events);
    if (!events.length || !addresses.length) {
      return { success: false, message: 'Address is not found!' };
    }

    return { success: true, address: addresses[2] };
  }

  async createOrderForNft(userAddress: string, dto: CreateOrderForNftDto) {
    const findTx = await this.findOne({
      tx_hash: dto.tx_hash,
      chain_id: dto.chain_id,
    });
    if (findTx) {
      return { success: false, message: 'Such transaction already exists' };
    }

    const user = await this.userService.findOrCreate(userAddress);

    let nft: Nft = await this.nftService.findOne({
      token_id: dto.token_id,
      address: ILike(dto.nft_address),
      chain_id: dto.chain_id,
    });

    if (nft) {
      const updateNftData = {
        owner: userAddress,
        nft_wallet_address: dto?.nft_wallet_address?.toLowerCase(),
        project_name: dto.project_name,
      };
      await this.nftService.updateNft(nft.id, updateNftData);
    } else {
      const isSablierNft = await this.sablierService.findOne(
        dto.nft_address,
        dto.chain_id,
      );

      if (isSablierNft) {
        nft = (
          await this.nftService.createSablierNft({
            collection_address: dto.nft_address,
            token_id: dto.token_id,
            owner: userAddress,
            chain_id: dto.chain_id,
          })
        ).newSablierNft;
      } else {
        const nftMetadata = (await this.moralisService.getNFTMetadata({
          chainId: dto.chain_id,
          tokenAddress: dto.nft_address,
          tokenId: dto.token_id,
        })) as TMoralisNFTMetadata;

        const {
          token_uri,
          symbol,
          nft: { name, image },
        } = nftMetadata;

        const createNftDto = {
          chain_id: dto.chain_id,
          project_name: dto.project_name,
          address: dto.nft_address,
          token_id: dto.token_id,
          owner: userAddress,
          nft_wallet_address: dto?.nft_wallet_address,
          ipfs_url: token_uri,
          name,
          symbol,
          image_url: image,
        };

        nft = await this.nftService.create(createNftDto);
      }

      if (!nft) {
        return { success: false, message: 'NFT was not created' };
      }
    }

    let addVestingMessage: string = '';

    if (!nft.vestings || nft.vestings.length === 0) {
      const addVesting = await this.vestingService.addVesting(dto);
      addVestingMessage = addVesting?.message;
    }

    const createOrderData = {
      chain_id: dto.chain_id,
      project_name: dto.project_name,
      user_address: userAddress,
      amount: dto.amount,
      remain_amount: dto.amount,
      offer_price: dto.offer_price,
      whitelist: dto.whitelist,
      tx_hash: dto.tx_hash,
      description: dto.description,
      nft: { id: nft.id },
      user: { id: user.id },
      price_per_token: dto.offer_price,
    };
    const order = await this.create(createOrderData);

    if (order) {
      return {
        success: true,
        message: `The order was successfully created. ${addVestingMessage}`,
      };
    }
  }

  async createOrderForToken(userAddress: string, dto: CreateOrderForTokenDto) {
    const findTx = await this.findOne({
      tx_hash: dto.tx_hash,
      chain_id: dto.chain_id,
    });
    if (findTx) {
      return { success: false, message: 'Such transaction already exists' };
    }

    const user = await this.userService.findOrCreate(userAddress);
    const getContractERC20 = await this.moralisService.getERC20TokenContract({
      chainId: dto.chain_id,
      tokenAddresses: [dto.token_address],
    });
    const contractData = getContractERC20[0];

    let offer_token_decimals: number = Number(contractData?.decimals);
    let symbol: string = contractData?.symbol;
    let name: string = contractData?.name;

    if (!offer_token_decimals) {
      offer_token_decimals = await this.web3Service.getTokenDecimals(
        dto.chain_id,
        ERC20abi,
        dto.token_address,
      );
    }
    if (!name) {
      name = await this.web3Service.getName(
        dto.chain_id,
        ERC20abi,
        dto.token_address,
      );
    }
    if (!symbol) {
      symbol = await this.web3Service.getSymbol(
        dto.chain_id,
        ERC20abi,
        dto.token_address,
      );
    }

    let token = await this.tokenService.findOne({
      address: ILike(dto.token_address),
      chain_id: dto.chain_id,
    });

    // TODO: find out how to get and save coinmarketcap_id each time token saved to db
    if (!token) {
      const createTokenDto: CreateTokenDto = {
        chain_id: dto.chain_id,
        name,
        symbol,
        address: dto.token_address,
        image_url: contractData.logo || '',
        decimals: offer_token_decimals,
        coinmarketcap_id: 0,
      };
      token = await this.tokenService.create(createTokenDto);
      if (!token) {
        return { success: false, message: 'Token was not created' };
      }
    }

    const offer_token_precision = 10n ** BigInt(offer_token_decimals);
    const price_per_token =
      (BigInt(dto.offer_price) * offer_token_precision) / BigInt(dto.amount);

    const createOrderData = {
      chain_id: dto.chain_id,
      offer_price: dto.offer_price,
      amount: dto.amount,
      remain_amount: dto.amount,
      whitelist: dto.whitelist,
      is_crowd_fill: dto.is_crowd_fill,
      token: { id: token.id },
      user: { id: user.id },
      tx_hash: dto.tx_hash,
      description: dto.description,
      price_per_token,
    };
    const order = await this.create(createOrderData);

    if (order) {
      return { success: true, message: 'The order was successfully created' };
    }
  }

  createQueryBuilder(tablesToJoin: string[]) {
    const query = this.orderRepository.createQueryBuilder('order');
    if (tablesToJoin.length === 1) {
      query.innerJoinAndSelect(
        `order.${tablesToJoin[0]}`,
        `${tablesToJoin[0]}`,
      );
    } else {
      tablesToJoin.map((tableName) =>
        query.leftJoinAndSelect(`order.${tableName}`, `${tableName}`),
      );
    }
    return query;
  }

  async getOrdersForNfts(dto: GetOrdersDto) {
    const { chainId } = dto;
    try {
      const queryBuilder = this.createQueryBuilder(['nft', 'user'])
        .where('nft.id IS NOT NULL')
        .andWhere('order.status = :status', {
          status: OrderStatusType.ACTIVE,
        })
        .andWhere('order.whitelist = :whitelistAddress', {
          whitelistAddress: NULL_ADDRESS,
        });

      if (chainId) {
        queryBuilder.andWhere('order.chain_id = :chainId', {
          chainId,
        });
      }

      const sortedQuery = this.filterSortService.applyFiltersForOrders({
        queryBuilder,
        dto,
        orderProperty: OrderProperty.NFT,
      });

      const [orders, totalElements] = await sortedQuery.getManyAndCount();

      const formattedOrders = [];

      for (const order of orders) {
        const nftOrderData = await this.getNftOrderData(order);
        formattedOrders.push(nftOrderData);
      }

      return {
        success: true,
        data: formattedOrders,
        totalElements,
      };
    } catch (error) {
      return {
        success: false,
        message: `getOrdersForNfts error: ${error.message}`,
      };
    }
  }

  private async getNftOrderData(order: Order) {
    try {
      const {
        id,
        created_at,
        status,
        nft,
        description,
        offer_price,
        whitelist,
        order_id,
        user,
        chain_id,
      } = order;
      const chainData = this.multiChainDataService.getChainData(chain_id);

      const { vestings } = await this.vestingService.findAllByNftAddress({
        chainId: chainData.chain_id,
        nft_wallet_address: nft.nft_wallet_address?.toLowerCase(),
        token_id: nft.token_id,
        token_address: nft.address,
      });

      const { decimals: pay_token_decimals } = chainData.tokens.pay_token;

      const offer_price_usdt = formatUnits(offer_price, pay_token_decimals);
      const native_to_usdt_rate = await this.coinMarketCapService.getRate(
        chainData.chain_id,
      );
      const offer_price_native = offer_price_usdt / native_to_usdt_rate;

      const nftOrderData = {
        id,
        order_id,
        chain_id,
        status,
        offer_date: created_at,
        description,
        owner: nft.owner || user.address,
        offer_price,
        offer_price_usdt,
        offer_price_native,
        nft_key: nft.name,
        nft_id: nft.token_id,
        image_url: nft.image_url,
        whitelist,
        token_address: nft.address?.toLowerCase(),
        type: EOrderType.NFT,
        token_id: nft.token_id,
        vesting: vestings[0] || {
          unclaimed: 'No info',
          start_date: 'No info',
          end_date: 'No info',
          vesting_contract_address: null,
          is_valid_vesting_contract: false,
          vesting_remains: 'No info',
          vesting_duration: 'No info',
          symbol: 'No info',
          streaming_frequency: 'No info',
          claim_portal_url: 'No info',
        },
      };
      return nftOrderData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOrdersForTokens(dto: GetOrdersDto) {
    const { chainId } = dto;
    const queryBuilder = this.createQueryBuilder(['token', 'user'])
      .where('token.id IS NOT NULL')
      .andWhere('order.status = :status', {
        status: OrderStatusType.ACTIVE,
      })
      .andWhere('order.whitelist = :whitelistAddress', {
        whitelistAddress: NULL_ADDRESS,
      });

    if (chainId) {
      queryBuilder.andWhere('order.chain_id = :chainId', {
        chainId,
      });
    }

    const sortedQuery = this.filterSortService.applyFiltersForOrders({
      queryBuilder,
      dto,
      orderProperty: OrderProperty.TOKEN,
    });

    const [orders, totalElements] = await sortedQuery.getManyAndCount();

    const formattedOrders = [];

    for (const order of orders) {
      const tokenOrderData = await this.getTokenOrderData(order);
      formattedOrders.push(tokenOrderData);
    }

    return {
      success: true,
      data: formattedOrders,
      totalElements,
    };
  }

  private async getTokenOrderData(order: Order) {
    try {
      const {
        id,
        order_id,
        created_at,
        status,
        token,
        description,
        offer_price,
        price_per_token,
        amount,
        remain_amount,
        whitelist,
        is_crowd_fill,
        user,
        chain_id,
      } = order;

      const {
        symbol,
        name,
        address: token_address,
        image_url,
        decimals,
      } = token;

      const { human_total_amount, human_remain_amount, progress } =
        this.calculateOfferTokenHumanAmoun({
          amount,
          remain_amount,
          decimals,
          isNft: false,
        });

      const {
        offer_price_usdt,
        offer_price_native,
        price_per_token_usdt,
        price_per_token_native,
        token_market_price_usdt,
        token_market_price_native,
        delta,
      } = await this.getOfferTokenPriceInUsdtAndNative({
        offer_price,
        price_per_token,
        chain_id,
        token_address,
        isNft: false,
      });

      const tokenOrderData = {
        id,
        order_id,
        chain_id,
        status,
        offer_date: created_at,
        description,
        owner: user?.address,
        total_amount: amount,
        remain_amount,
        human_total_amount,
        human_remain_amount,
        progress,
        is_crowd_fill,
        offer_price,
        price_per_token,
        offer_price_usdt,
        offer_price_native,
        price_per_token_usdt,
        price_per_token_native,
        token_market_price_usdt,
        token_market_price_native,
        delta,
        decimals,
        whitelist,
        name,
        symbol,
        image_url,
        token_address,
        type: EOrderType.TOKEN,
        token_id: '',
      };
      return tokenOrderData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOrdersForMe(userAddress: string, dto: GetOrdersForMeDto) {
    const { chainId } = dto;
    const queryBuilder = this.createQueryBuilder(['token', 'nft', 'user'])
      .where('order.whitelist = :userAddress', { userAddress })
      .andWhere('order.status = :status', {
        status: OrderStatusType.ACTIVE,
      })
      .andWhere('order.chain_id = :chainId', {
        chainId,
      });

    const sortedQuery = this.filterSortService.applyFiltersForOrders({
      queryBuilder,
      dto,
      orderProperty: OrderProperty.ME,
    });

    const [orders, totalElements]: [Order[], number] =
      await sortedQuery.getManyAndCount();

    const formattedOrders = [];

    for (const order of orders) {
      const {
        id,
        order_id,
        created_at,
        status,
        token,
        nft,
        description,
        offer_price,
        price_per_token,
        amount,
        remain_amount,
        whitelist,
        is_crowd_fill,
        user,
        chain_id,
      } = order;
      const isNft = !!nft;
      // const { symbol, name, image_url, address: token_address } = token || nft;

      const { human_total_amount, human_remain_amount, progress } =
        this.calculateOfferTokenHumanAmoun({
          amount,
          remain_amount,
          decimals: token?.decimals,
          isNft,
        });

      const {
        offer_price_usdt,
        offer_price_native,
        price_per_token_usdt,
        price_per_token_native,
        token_market_price_usdt,
        token_market_price_native,
        delta,
      } = await this.getOfferTokenPriceInUsdtAndNative({
        offer_price,
        price_per_token,
        chain_id,
        token_address: isNft ? nft.address : token.address,
        isNft,
      });

      const orderType = isNft ? EOrderType.NFT : EOrderType.TOKEN;

      let vesting;
      if (isNft) {
        const { vestings } = await this.vestingService.findAllByNftAddress({
          chainId: dto.chainId,
          nft_wallet_address: nft.nft_wallet_address?.toLowerCase(),
          token_id: nft.token_id,
          token_address: nft.address,
        });
        vesting = vestings[0] || {
          unclaimed: 'No info',
          start_date: 'No info',
          end_date: 'No info',
          vesting_contract_address: null,
          vesting_remains: 'No info',
          vesting_duration: 'No info',
          symbol: 'No info',
          streaming_frequency: 'No info',
          claim_portal_url: 'No info',
        };
      }

      const tokenOrderData = {
        id,
        order_id,
        chain_id,
        status,
        type: orderType,
        name: isNft ? nft.name : token.name,
        symbol: isNft ? nft.symbol : token.symbol,
        image_url: isNft ? nft.image_url : token.image_url || '',
        token_id: nft ? nft.token_id : '',
        offer_date: created_at,
        description,
        owner: user.address,
        total_amount: amount,
        remain_amount,
        human_total_amount,
        human_remain_amount,
        progress,
        is_crowd_fill,
        offer_price,
        price_per_token,
        offer_price_usdt,
        offer_price_native,
        price_per_token_usdt,
        price_per_token_native,
        token_market_price_usdt,
        token_market_price_native,
        delta,
        decimals: !!token ? token.decimals : 18,
        whitelist,
        vesting,
      };
      formattedOrders.push(tokenOrderData);
    }

    return {
      success: true,
      data: formattedOrders,
      totalElements,
    };
  }

  async editOrderById(userId: string, dto: EditOrder) {
    const { id, description, new_price } = dto;

    if (!new_price) {
      return {
        success: false,
        message: 'No fields were chosen for update',
      };
    }

    const orderToEdit = await this.findOne({ id });

    if (!orderToEdit) {
      return {
        success: false,
        message: 'Order not found',
      };
    }

    if (orderToEdit.user.id !== userId) {
      return {
        success: false,
        message: 'This order does not belong to the current user',
      };
    }

    const isNFT = !!orderToEdit.nft;

    const offer_token_decimals = isNFT ? 18 : orderToEdit.token.decimals;

    const offer_token_precision = 10 ** offer_token_decimals;

    const price_per_token = isNFT
      ? new_price
      : BigInt(Math.round(Number(new_price) * offer_token_precision)) /
        BigInt(orderToEdit.amount);

    const payload = {
      description,
      offer_price: new_price,
      price_per_token,
    };

    await this.update(orderToEdit.id, payload);

    return {
      success: true,
      message: `Order was successfully updated`,
    };
  }

  async cancelOder(userId: string, dto: CancelOrderDto) {
    const { id } = dto;

    const orderToCancel = await this.findOne({ id });
    if (!orderToCancel) {
      return { success: false, message: 'Order is not found' };
    }
    if (orderToCancel.user.id.toLowerCase() !== userId.toLowerCase()) {
      return { success: false, message: 'The order does not belong to you' };
    }
    if (orderToCancel.status !== OrderStatusType.ACTIVE) {
      return { success: false, message: 'The order was sold or canceled' };
    }

    await this.orderRepository.update(orderToCancel.id, {
      remain_amount: 0n,
      is_closed: true,
      status: OrderStatusType.CANCELED,
    });
    return { success: true, message: 'Order was successfully canceled' };
  }

  async getCreatedByMe(userId: string, dto: GetCreatedByMeDto) {
    const { chainId } = dto;
    const queryBuilder = this.createQueryBuilder(['token', 'nft', 'user'])
      .where('order.user = :userId', { userId })
      .andWhere('order.chain_id = :chainId', {
        chainId,
      });

    const sortedQuery = this.filterSortService.applyFiltersForOrders({
      queryBuilder,
      dto,
      orderProperty: OrderProperty.ME,
    });

    const [orders, totalElements]: [Order[], number] =
      await sortedQuery.getManyAndCount();

    const formattedOrders = [];

    for (const order of orders) {
      const {
        id,
        order_id,
        created_at,
        status,
        token,
        nft,
        description,
        offer_price,
        price_per_token,
        amount,
        remain_amount,
        user,
        chain_id,
      } = order;
      const isNft = !!nft;

      const { human_total_amount, human_remain_amount, progress } =
        this.calculateOfferTokenHumanAmoun({
          amount,
          remain_amount,
          decimals: token?.decimals,
          isNft,
        });

      const {
        offer_price_usdt,
        offer_price_native,
        price_per_token_usdt,
        price_per_token_native,
        token_market_price_usdt,
        token_market_price_native,
        delta,
      } = await this.getOfferTokenPriceInUsdtAndNative({
        offer_price,
        price_per_token,
        chain_id,
        token_address: isNft ? nft.address : token.address,
        isNft,
      });

      let vesting;
      if (isNft) {
        const { vestings } = await this.vestingService.findAllByNftAddress({
          chainId: chain_id,
          nft_wallet_address: nft.nft_wallet_address?.toLowerCase(),
          token_id: nft.token_id,
          token_address: nft.address,
        });
        vesting = vestings[0] || {
          unclaimed: 'No info',
          start_date: 'No info',
          end_date: 'No info',
          vesting_contract_address: null,
          vesting_remains: 'No info',
          vesting_duration: 'No info',
          symbol: 'No info',
          streaming_frequency: 'No info',
          claim_portal_url: 'No info',
        };
      }

      const tokenOrderData = {
        id,
        order_id,
        chain_id,
        status,
        type: isNft ? EOrderType.NFT : EOrderType.TOKEN,
        name: isNft ? nft.name : token.name,
        symbol: isNft ? nft.symbol : token.symbol,
        description,
        image_url: isNft ? nft.image_url : token.image_url || '',
        token_address: isNft ? nft.address : token.address,
        token_id: isNft ? nft.token_id : '',
        offer_date: created_at,
        owner: user.address,
        total_amount: amount,
        human_total_amount,
        remain_amount,
        human_remain_amount,
        progress,
        offer_price,
        price_per_token,
        offer_price_usdt,
        offer_price_native,
        price_per_token_usdt,
        price_per_token_native,
        token_market_price_usdt,
        token_market_price_native,
        delta,
        vesting,
      };
      formattedOrders.push(tokenOrderData);
    }

    return {
      success: true,
      data: formattedOrders,
      totalElements,
    };
  }

  async updateOrderAmount(dto: UpdateOrderAmountDto) {
    const { orderId, amount } = dto;
    const order = await this.findOne({ id: orderId });

    if (!order) throw new Error(`No order with id ${orderId} in DB`);

    if (BigInt(order.remain_amount) < BigInt(amount))
      throw new Error(`Not enough amount left!`);

    const newAmount = BigInt(order.remain_amount) - BigInt(amount);

    const updateData =
      newAmount === 0n
        ? {
            remain_amount: newAmount,
            is_closed: true,
            status:
              dto?.status === ETransactionStatus.WITHDRAWN
                ? OrderStatusType.CANCELED
                : OrderStatusType.SOLD,
          }
        : {
            remain_amount: newAmount,
            is_closed: false,
            status: OrderStatusType.ACTIVE,
          };

    await this.orderRepository.update({ id: orderId }, updateData);

    return {
      ...order,
      ...updateData,
      remain_amount: updateData.remain_amount,
    };
  }

  async getTokenOrderDetails(dto: GetTokenOrderDetailsDto) {
    const { orderId, chainId } = dto;
    const order = await this.createQueryBuilder(['token', 'transactions'])
      .leftJoinAndSelect('transactions.user', 'user')
      .where('order.id = :orderId', { orderId })
      .getOne();

    if (!order)
      return {
        success: false,
        message: 'No orders with such orderId',
      };

    const { token } = order;

    if (!token)
      return {
        success: false,
        message: `The order with id ${orderId} is not for token`,
      };

    const transactionHistory = await this.formatTransactionHistory(
      order,
      chainId,
    );

    const tokenDetail = await this.tokenService.getTokenDetails({
      token_address: token.address,
      chainId,
      symbol: token.symbol,
      token_name: token.name,
    });

    return {
      success: true,
      data: {
        tokenDetail: tokenDetail.data,
        transactionHistory,
      },
    };
  }

  private async formatTransactionHistory(order: Order, chainId: string) {
    const { token, transactions } = order;
    const native_to_usdt_rate =
      await this.coinMarketCapService.getRate(chainId);
    return transactions.map((transaction: Transaction) => {
      const chainData = this.multiChainDataService.getChainData(chainId);
      const pay_token_decimals = chainData.tokens.pay_token.decimals;
      const { amount } = transaction;
      const humanAmount = parseFloat(
        formatUnits(amount, token ? token.decimals : 18).toFixed(6),
      );
      const humanPricePerToken = formatUnits(
        order.price_per_token,
        token ? pay_token_decimals : 18,
      );
      const price_usdt = humanAmount * humanPricePerToken;
      const price_native = price_usdt / native_to_usdt_rate;

      return {
        address: transaction.user.address,
        amount: humanAmount,
        price_usdt,
        price_native,
        payment_date: transaction.payment_date,
      };
    });
  }

  async getOrderInfo(dto: GetOrderDto) {
    try {
      const { orderId, chainId } = dto;
      const order = await this.createQueryBuilder([
        'nft',
        'token',
        'transactions',
      ])
        .leftJoinAndSelect('transactions.user', 'user')
        .where('order.id = :orderId', { orderId })
        .getOne();

      if (!order) throw new NotFoundException('Order is not found!');

      if (order.status !== OrderStatusType.ACTIVE)
        throw new NotFoundException('No active orders with such orderId');

      let data;
      if (order.token) {
        data = await this.getTokenOrderData(order);

        const transactionHistory = await this.formatTransactionHistory(
          order,
          chainId,
        );
        data['transactionHistory'] = transactionHistory;

        const tokenDetail = await this.tokenService.getTokenDetails({
          token_address: order.token.address,
          chainId,
          symbol: order.token.symbol,
          token_name: order.token.name,
        });
        data['tokenDetail'] = tokenDetail.data;
      }

      if (order.nft) data = await this.getNftOrderData(order);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  private async getOfferTokenPriceInUsdtAndNative(
    dto: getOfferTokenPriceInUsdtAndNativeDto,
  ): Promise<getOfferTokenPriceInUsdtAndNativeResponse> {
    const { offer_price, price_per_token, chain_id, token_address, isNft } =
      dto;
    const native_to_usdt_rate =
      await this.coinMarketCapService.getRate(chain_id);

    const chainData = this.multiChainDataService.getChainData(chain_id);
    const usdt_decimals = chainData.tokens.pay_token.decimals;

    const offer_price_usdt = formatUnits(offer_price, usdt_decimals);
    const offer_price_native =
      native_to_usdt_rate === 0
        ? native_to_usdt_rate
        : offer_price_usdt / native_to_usdt_rate;

    const price_per_token_usdt = formatUnits(price_per_token, usdt_decimals);
    const price_per_token_native =
      native_to_usdt_rate === 0
        ? native_to_usdt_rate
        : price_per_token_usdt / native_to_usdt_rate;

    let token_market_price_usdt: number | null = null;
    let token_market_price_native: number | null = null;
    let delta: number | null = null;

    const coinmarketCapTokenId = isNft
      ? 0
      : await this.coinMarketCapService.getCoinmarketCapTokenIdByAddress(
          token_address,
          chain_id,
        );
    if (coinmarketCapTokenId > 0) {
      token_market_price_usdt =
        await this.coinMarketCapService.getRateByTokenIds(
          coinmarketCapTokenId,
          CoinMarketCapTokenIds.USDT,
        );
      token_market_price_native =
        native_to_usdt_rate === 0
          ? native_to_usdt_rate
          : token_market_price_usdt / native_to_usdt_rate;
      delta =
        ((price_per_token_usdt - token_market_price_usdt) /
          token_market_price_usdt) *
        100;
    }

    const result = {
      offer_price_usdt,
      offer_price_native,
      price_per_token_usdt,
      price_per_token_native,
      token_market_price_usdt,
      token_market_price_native,
      delta,
    };

    for (const key in result) {
      result[key] =
        result[key] || result[key] === 0 ? roundToPrecision(result[key]) : null;
    }

    return result;
  }

  private calculateOfferTokenHumanAmoun(dto: {
    amount: bigint;
    remain_amount: bigint;
    decimals: number;
    isNft: boolean;
  }): {
    human_total_amount: number;
    human_remain_amount: number;
    progress: number;
  } {
    const { amount, remain_amount, decimals = 18, isNft } = dto;
    const human_total_amount = isNft
      ? Number(amount)
      : formatUnits(amount, decimals);
    const human_remain_amount = isNft
      ? Number(remain_amount)
      : formatUnits(remain_amount, decimals);
    const progress = parseFloat(
      (Number((amount - remain_amount) / amount) * 100).toFixed(6),
    );

    return { human_total_amount, human_remain_amount, progress };
  }
}
