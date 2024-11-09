import { In, Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import * as abiERC721 from 'src/@constants/abis/ERC721.json';
import { MultiChainApiService } from 'src/multichain/multichain-api.service';
import { MultiChainDataService } from 'src/multichain/multichain-data.service';
import { sleep } from 'src/utils';
import { Web3Service } from 'src/web3/web3.service';

import { SablierContract } from './entities/sablierContracts.entity';
import { StartBlockSablier } from './entities/sablierStartBlock.entity';

@Injectable()
export class SablierService {
  private readonly logger: Logger = new Logger(SablierService.name);
  public readonly CLAIM_PORTAL_URL: string = 'https://app.sablier.com/';

  constructor(
    @InjectRepository(StartBlockSablier)
    private readonly startBlockRepository: Repository<StartBlockSablier>,
    @InjectRepository(SablierContract)
    private readonly contractRepository: Repository<SablierContract>,
    private readonly web3Service: Web3Service,
    private readonly multiChainApiService: MultiChainApiService,
    private readonly multiChainDataService: MultiChainDataService,
  ) {}

  @Cron('0 0 * * *')
  async start() {
    this.logger.warn(`Check Sablier contracts starts`);
    const availableChains = this.multiChainDataService.getAvailableChains();
    await Promise.all(
      availableChains.map((chainId) =>
        this.getSablierContracts(chainId)
          .then(() => sleep(1000))
          .catch((error) => this.logger.error(error)),
      ),
    );
    this.logger.warn(`Check Sablier contracts finished successfully`);
  }

  public async findOne(
    address: string,
    chain_id: string,
  ): Promise<SablierContract | null> {
    const key = this.getSablierContractKey(chain_id, address);
    return await this.contractRepository.findOne({
      where: { key },
    });
  }

  private async createSablierContract(dto: SablierContract[]): Promise<void> {
    const payload: SablierContract[] = [];

    const keys = dto.map((item) =>
      this.getSablierContractKey(item.chain_id, item.contract_address),
    );

    const existingContracts = await this.contractRepository.find({
      where: { key: In(keys) },
    });

    const existingKeysSet = new Set(
      existingContracts.map((contract) => contract.key),
    );

    for (const item of dto) {
      const { contract_address, abi_method, chain_id, id } = item;

      const key = this.getSablierContractKey(chain_id, contract_address);

      if (existingKeysSet.has(key)) continue;

      payload.push({
        id,
        key,
        abi_method,
        contract_address: contract_address.toLowerCase(),
        chain_id,
      });
    }
    await this.contractRepository.save(payload);
  }

  private async createStartBlock(dto: {
    chain_id: string;
    block_number: number;
  }) {
    return await this.startBlockRepository.save(dto);
  }

  private async getStartblockByChainId(
    chain_id: string,
  ): Promise<StartBlockSablier> {
    return await this.startBlockRepository.findOne({ where: { chain_id } });
  }

  private async updateStartblock(dto: {
    id: string;
    chain_id: string;
    block_number: number;
  }) {
    return await this.startBlockRepository.save(dto);
  }

  private async getBlocks(chain_id: string) {
    const startBlockentity = await this.getStartblockByChainId(chain_id);
    let startBlock: number;
    let startBlockentityId: string;

    if (startBlockentity) {
      startBlock = Number(startBlockentity.block_number);
      startBlockentityId = startBlockentity.id;
    } else {
      startBlock =
        this.multiChainDataService.getChainData(chain_id).sablierInfo
          .start_block;
      const newStartBlockentity = await this.createStartBlock({
        chain_id,
        block_number: startBlock,
      });
      startBlockentityId = newStartBlockentity.id;
    }
    const endBlock = Number(await this.web3Service.getLatestBlock(chain_id));
    return { startBlock, endBlock, startBlockentityId };
  }

  private async getSablierContracts(chainId: string) {
    const chainData = this.multiChainDataService.getChainData(chainId);
    const { deployer_address, method_id } = chainData.sablierInfo;
    const { startBlock, endBlock, startBlockentityId } =
      await this.getBlocks(chainId);
    try {
      const transactions =
        await this.multiChainApiService.getTransactionsByAddress(chainId, {
          address: deployer_address,
          startBlock,
          endBlock,
        });

      if (transactions.length === 0) {
        await this.updateStartblock({
          id: startBlockentityId,
          chain_id: chainId,
          block_number: Number(endBlock),
        });
        return;
      }

      const txHashes = transactions.reduce((hashes, tx) => {
        if (tx.methodId === method_id) {
          hashes.push(tx.hash);
        }
        return hashes;
      }, []);

      const contracts = await this.getContractAddresses(chainId, txHashes);
      const sablierNftCollections = await this.getNFTContracts(
        chainId,
        contracts,
      );
      if (sablierNftCollections.length > 0) {
        await this.createSablierContract(sablierNftCollections);
      }

      await this.updateStartblock({
        id: startBlockentityId,
        chain_id: chainId,
        block_number: Number(endBlock),
      });
    } catch (error) {
      this.logger.warn(`Check Sablier contracts finished with error`);
      this.logger.error('Error fetching transactions:', error);
    }
  }

  private async getContractAddresses(
    chainId: string,
    txHashes: string[],
  ): Promise<string[]> {
    const contractAddresses = [];

    for (const txHash of txHashes) {
      const contractAddress = await this.getInternalContractAddress(
        chainId,
        txHash,
      );
      if (contractAddress) {
        contractAddresses.push(contractAddress);
      }
      await sleep(1000);
    }

    return contractAddresses;
  }

  private async getInternalContractAddress(
    chainId: string,
    internalTxHash: string,
  ): Promise<string | null> {
    try {
      const internalTransactions =
        await this.multiChainApiService.getInternalTransactionsByTxHash(
          chainId,
          { internalTxHash },
        );

      return internalTransactions.find((tx) => tx.contractAddress)
        .contractAddress;
    } catch (error) {
      this.logger.error(
        `Error fetching data for txHash ${internalTxHash}:`,
        error,
      );
      return null;
    }
  }

  private async getNFTContracts(
    chainId: string,
    contracts: string[],
  ): Promise<SablierContract[]> {
    const contractsArr: SablierContract[] = [];

    for (const contractAddress of contracts) {
      try {
        const contractName = await this.web3Service.getName(
          chainId,
          abiERC721,
          contractAddress,
        );

        if (contractName) {
          const fullAbi = await this.multiChainApiService.getAbi(chainId, {
            address: contractAddress,
          });
          const getMethods = fullAbi.filter(
            (method) =>
              'name' in method &&
              (method.name === 'getStream' || method.name === 'getAsset'),
          );
          const getStreamMethodString = JSON.stringify(getMethods);
          const key = this.getSablierContractKey(chainId, contractAddress);
          contractsArr.push({
            key,
            contract_address: contractAddress.toLowerCase(),
            abi_method: getStreamMethodString,
            chain_id: chainId,
          });
        }
      } catch (error) {
        this.logger.log(error.message);
      }
    }
    return contractsArr;
  }

  private getSablierContractKey(chain_id: string, address: string) {
    return `${chain_id}-${address.toLowerCase()}`;
  }
}
