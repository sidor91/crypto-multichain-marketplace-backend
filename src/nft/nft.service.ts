import { ILike, Repository } from 'typeorm';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractAbi } from 'web3';

import { GetUserInfoDTO } from 'src/@common/dto/get-user-info.dto';
import * as abiERC20 from 'src/@constants/abis/ERC20.json';
import * as abiSablier from 'src/@constants/abis/Sablier.json';
import { EVestingContractType } from 'src/@enums';
import { TMoralisNFTMetadata, TMoralisUserNfts } from 'src/@types';
import { CoinMarketCapService } from 'src/coinmarketcap/coinmarketcap.service';
import { MoralisService } from 'src/moralis/moralis.service';
import { SablierService } from 'src/sablier/sablier.service';
import { FilterSortService } from 'src/sortingAndFiltering/filter-sort.service';
import { formatUnits } from 'src/utils';
import { VestingService } from 'src/vesting/vesting.service';
import { VestingContractService } from 'src/vesting_contract/vesting_contract.service';
import { Web3Service } from 'src/web3/web3.service';

import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { Nft } from './entities/nft.entity';

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(Nft)
    private readonly nftRepository: Repository<Nft>,
    private readonly moralisService: MoralisService,
    private readonly sablierService: SablierService,
    private readonly web3Service: Web3Service,
    private readonly filterSortService: FilterSortService,
    private readonly coinMarketCapService: CoinMarketCapService,
    @Inject(forwardRef(() => VestingService))
    private readonly vestingService: VestingService,
    private readonly vestingContractService: VestingContractService,
  ) {}

  async create(dto: CreateNftDto) {
    return await this.nftRepository.save(dto);
  }

  async findAll(request = {}) {
    return await this.nftRepository.find({ where: request });
  }

  async findOne(request = {}) {
    return await this.nftRepository.findOne({
      where: request,
      relations: { vestings: { vesting_contract: true } },
    });
  }

  async updateNft(id: string, dto: UpdateNftDto) {
    return await this.nftRepository.update({ id }, dto);
  }

  async getUserNFTs(dto: GetUserInfoDTO) {
    const { address, chainId, sortBy, sortOrder, page, limit, query } = dto;
    const moralisNFTs = (await this.moralisService.getAllNFTsByUserAddress({
      chainId,
      userAddress: address,
    })) as TMoralisUserNfts;

    for (const nft of moralisNFTs) {
      const { collection_address, token_id } = nft;
      nft['nftInDb'] = null;
      const nftInDb = await this.findOne({
        address: ILike(collection_address._value),
        token_id,
      });
      if (nftInDb) {
        const { id, project_name, nft_wallet_address } = nftInDb;
        nft['nftInDb'] = {};
        nft['nftInDb']['nft_id'] = id;
        nft['nftInDb']['project_name'] = project_name;
        nft['nftInDb']['nft_wallet_address'] =
          nft_wallet_address?.toLowerCase();
        if (nftInDb.vestings.length > 0) {
          nft['nftInDb']['vestings'] = (
            await this.vestingService.findAllByNftAddress({
              nft_wallet_address: nftInDb.nft_wallet_address?.toLowerCase(),
              chainId,
              token_id,
              token_address: collection_address._value.toLowerCase(),
            })
          ).vestings;
        }
        // TODO: handle if nftindb but no vestings
      } else {
        const isSablierContract = await this.sablierService.findOne(
          collection_address._value,
          chainId,
        );
        if (isSablierContract) {
          const newNft = await this.createSablierNft({
            collection_address: collection_address._value,
            token_id,
            chain_id: chainId,
            owner: address,
          });

          const { newSablierNft, vesting } = newNft;

          nft['nftInDb'] = newSablierNft;

          nft['nftInDb']['vestings'] = [vesting];
        }
      }
    }

    const { data, totalElements } =
      this.filterSortService.applyFiltersForAssets(
        { sortBy, sortOrder, page, limit, query },
        moralisNFTs,
      );

    const native_to_usdt_rate =
      await this.coinMarketCapService.getRate(chainId);

    return {
      success: true,
      data,
      totalElements,
      native_to_usdt_rate,
    };
  }

  async createSablierNft(dto: {
    collection_address: string;
    token_id: string;
    chain_id: string;
    owner: string;
  }) {
    const { collection_address, token_id, chain_id, owner } = dto;
    let abi: ContractAbi = abiSablier;

    const sablierContract = await this.sablierService.findOne(
      collection_address,
      chain_id,
    );

    if (sablierContract) {
      abi = JSON.parse(sablierContract.abi_method);
    }

    const nft_collection_contract = this.web3Service.getContract(
      chain_id,
      abi,
      collection_address,
    );

    const vesting_token_address: string = await nft_collection_contract.methods
      .getAsset(token_id)
      .call();

    const vesting_token_contract =
      await this.moralisService.getERC20TokenContract({
        chainId: dto.chain_id,
        tokenAddresses: [vesting_token_address],
      });
    const vesting_token_data = vesting_token_contract[0];

    const vesting_token_symbol = await this.web3Service.getSymbol(
      chain_id,
      abiERC20,
      vesting_token_address,
    );

    const {
      startTime,
      endTime,
      total_vesting_amount,
      streaming_frequency,
      unclaimed_amount,
    } = await this.vestingService.getSablierVestingInfo(
      chain_id,
      nft_collection_contract,
      token_id,
    );

    const nftMetadata = (await this.moralisService.getNFTMetadata({
      chainId: chain_id,
      tokenAddress: collection_address,
      tokenId: token_id,
    })) as TMoralisNFTMetadata;

    const {
      symbol: nft_symbol,
      token_uri: nft_ipfs_url,
      nft: { name: nft_name, image: nft_image },
    } = nftMetadata;

    const createNftDto = {
      chain_id,
      project_name: 'Crypto multichain marketpalce',
      address: collection_address,
      token_id,
      owner,
      symbol: nft_symbol,
      ipfs_url: nft_ipfs_url,
      image_url: vesting_token_data?.logo || nft_image || '',
      name: nft_name,
    };

    const nft: Nft = await this.create(createNftDto);

    const vestingContractDto = {
      symbol: vesting_token_symbol,
      address: collection_address,
      token_address: vesting_token_address,
      token_id,
      chain_id,
      type: EVestingContractType.SABLIER,
    };

    const vestingContract =
      await this.vestingContractService.findOrCreate(vestingContractDto);

    const vestingDto = {
      start_date: startTime,
      end_date: endTime,
      total_vesting_amount: BigInt(total_vesting_amount),
      type: EVestingContractType.SABLIER,
      streaming_frequency,
      claim_portal_url: this.sablierService.CLAIM_PORTAL_URL,
      nft,
      chain_id,
      vesting_contract: vestingContract,
    };

    await this.vestingService.create(vestingDto);

    const tokenDecimal = await this.web3Service.getTokenDecimals(
      chain_id,
      abiERC20,
      vesting_token_address,
    );

    const lockedBalance = Number(unclaimed_amount) / 10 ** tokenDecimal;

    const { vesting_remains, vesting_duration } =
      this.vestingService.defineVestingTime(
        EVestingContractType.SABLIER,
        startTime,
        endTime,
      );

    const data = {
      type: EVestingContractType.SABLIER,
      unclaimed: lockedBalance,
      start_date: startTime,
      end_date: endTime,
      vesting_contract_address: collection_address,
      vesting_remains,
      vesting_duration,
      symbol: vesting_token_symbol,
      streaming_frequency,
      claim_portal_url: this.sablierService.CLAIM_PORTAL_URL,
      token_address: vesting_token_address,
      total_vesting_amount: total_vesting_amount.toString(),
      human_total_vesting_amount: formatUnits(
        total_vesting_amount,
        tokenDecimal,
      ),
    };

    return { newSablierNft: nft, vesting: data };
  }
}
