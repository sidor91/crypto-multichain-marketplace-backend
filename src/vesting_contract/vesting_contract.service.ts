import { ILike, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as ERC20tokenAbi from 'src/@constants/abis/ERC20.json';
import { vestingMethods } from 'src/@constants/vestingMethods';
import { EVestingContractType } from 'src/@enums';
import { MultiChainApiService } from 'src/multichain/multichain-api.service';
import { Web3Service } from 'src/web3/web3.service';

import { CheckVestingContractDto } from './dto/check-vesting_contract.dto';
import { CreateVestingContractDto } from './dto/create-vesting_contract.dto';
import { VestingContract } from './entities/vesting_contract.entity';

@Injectable()
export class VestingContractService {
  constructor(
    @InjectRepository(VestingContract)
    private readonly vestingContractRepository: Repository<VestingContract>,
    private readonly web3Service: Web3Service,
    private readonly multiChainApiService: MultiChainApiService,
  ) {}

  async create(dto: VestingContract) {
    return await this.vestingContractRepository.save(dto);
  }

  async findAll(request = {}) {
    return await this.vestingContractRepository.find({ where: request });
  }

  async findOne(request = {}) {
    return await this.vestingContractRepository.findOne({
      where: request,
    });
  }

  async findOrCreate(dto: CreateVestingContractDto) {
    const { chain_id, address, token_id, type } = dto;
    try {
      const vestingContractAddressInDb = await this.findOne({
        address: ILike(address),
        chain_id,
      });
      if (vestingContractAddressInDb) return vestingContractAddressInDb;

      const vesting_token_address = dto.token_address
        ? dto.token_address
        : await this.getVestingTokenAddress({
            address,
            token_id,
            chain_id,
            type,
          });
      let vesting_token_symbol = '';

      if (type !== EVestingContractType.CUSTOM) {
        vesting_token_symbol = await this.web3Service.getSymbol(
          chain_id,
          ERC20tokenAbi,
          vesting_token_address,
        );
      } else {
        vesting_token_symbol = dto.symbol;
      }

      const vestingContractData = {
        chain_id,
        address,
        token_address: vesting_token_address,
        symbol: vesting_token_symbol,
        type,
        image_url: undefined,
      };

      const vestingContract = await this.create(vestingContractData);

      return vestingContract;
    } catch (error) {
      throw new BadRequestException(
        `Create vesting contract error. ${error.message}`,
      );
    }
  }

  private getVestingContractType(abiContract: any): string | null {
    for (const vestingType in vestingMethods) {
      if (vestingMethods.hasOwnProperty(vestingType)) {
        const methods = vestingMethods[vestingType];
        let matchCount = 0;

        for (const method of methods) {
          const matchingAbiMethods = abiContract.filter(
            (abiMethod) =>
              abiMethod.name === method.name &&
              abiMethod.inputs.length === method.inputs.length,
          );

          for (const abiMethod of matchingAbiMethods) {
            let inputsMatch = true;
            for (let i = 0; i < abiMethod.inputs.length; i++) {
              if (abiMethod.inputs[i].type !== method.inputs[i].type) {
                inputsMatch = false;
                break;
              }
            }
            if (inputsMatch) {
              matchCount++;
              break;
            }
          }
        }

        if (matchCount === methods.length) {
          return vestingType;
        }
      }
    }
    return EVestingContractType.CUSTOM;
  }

  private async getAbiContract(address: string, chainId: string) {
    const errorMessage = `Wrong contract address ${address}! It is not verified in chain ${chainId}!`;
    try {
      const abi = await this.multiChainApiService.getAbi(chainId, { address });

      if (!abi) throw new Error(errorMessage);

      return abi;
    } catch (error) {
      throw new Error(errorMessage);
    }
  }

  public async checkVestingContractType(dto: CheckVestingContractDto) {
    const { address, chain_id } = dto;
    try {
      const isContractAddress = await this.web3Service.checkIsContractAddress(
        chain_id,
        address,
      );

      if (!isContractAddress)
        return {
          success: false,
          message: `It is not vesting contract address!`,
        };

      const vestingContractAddressInDb = await this.findOne({
        address,
        chain_id,
      });

      if (vestingContractAddressInDb)
        return { success: true, type: vestingContractAddressInDb.type };

      const abiContract = await this.getAbiContract(address, chain_id);

      const vestingContractType = this.getVestingContractType(abiContract);
      return { success: true, type: vestingContractType };
    } catch (error) {
      if (error.message.includes(`It is not verified in chain ${chain_id}`))
        return {
          success: true,
          type: EVestingContractType.CUSTOM,
          message: error.message,
        };
      return {
        success: false,
        message: `Check vesting contract type error. ${error.message}`,
      };
    }
  }

  private async getVestingTokenAddress(dto: {
    address: string;
    token_id: string;
    chain_id: string;
    type: EVestingContractType;
  }) {
    const { address, token_id, chain_id, type } = dto;

    const abi = await this.getAbiContract(address, chain_id);
    const vesting_contract = this.web3Service.getContract(
      chain_id,
      abi,
      address,
    );

    let vesting_token_address: string = '';
    switch (type) {
      case EVestingContractType.SABLIER:
        vesting_token_address = await vesting_contract.methods
          .getAsset(token_id)
          .call();
        break;
      case EVestingContractType.GAMIUM:
        vesting_token_address = await vesting_contract.methods
          .shoToken()
          .call();
        break;
      case EVestingContractType.ONDO:
        vesting_token_address = await vesting_contract.methods.ondo().call();
        break;
      default:
        vesting_token_address = await vesting_contract.methods.token().call();
        break;
    }

    return vesting_token_address;
  }
}
