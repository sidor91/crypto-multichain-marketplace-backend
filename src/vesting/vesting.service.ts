import { ILike, Repository } from 'typeorm';

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract, ContractAbi } from 'web3';

import { DAY_IN_MS, DAY_IN_SEC, NULL_ADDRESS } from 'src/@constants';
import * as abiErc20 from 'src/@constants/abis/ERC20.json';
import * as abiOndoToken from 'src/@constants/abis/OndoToken.json';
import { vestingContractAbi } from 'src/@constants/abis/vestingContractAbi';
import { EVestingContractType, EVestingType } from 'src/@enums';
import {
  TGamium1Vesting,
  TGamium2Vesting,
  TGenkoshiVesting,
  TLinearCliff,
  TLinearVesting,
  TOndoVesting,
  TRetroactiveVesting,
  TSablierVesting,
} from 'src/@types';
import { MoralisService } from 'src/moralis/moralis.service';
import { MultiChainApiService } from 'src/multichain/multichain-api.service';
import { NftService } from 'src/nft/nft.service';
import { SablierService } from 'src/sablier/sablier.service';
import { formatUnits, timestampToDate } from 'src/utils';
import { VestingContractService } from 'src/vesting_contract/vesting_contract.service';
import { Web3Service } from 'src/web3/web3.service';

import { AddVestingDto } from './dto/add-vesting.dto';
import { CreateVestingDto } from './dto/create-vesting.dto';
import { ListVestingDto } from './dto/list-vesting.dto';
import { Vesting } from './entities/vesting.entity';

@Injectable()
export class VestingService {
  constructor(
    @InjectRepository(Vesting)
    private readonly vestingRepository: Repository<Vesting>,
    @Inject(forwardRef(() => NftService))
    private readonly nftService: NftService,
    private readonly vestingContractService: VestingContractService,
    private readonly web3Service: Web3Service,
    private readonly moralisService: MoralisService,
    private readonly sablierService: SablierService,
    private readonly multiChainApiService: MultiChainApiService,
  ) {}

  async create(dto: CreateVestingDto) {
    return await this.vestingRepository.save(dto);
  }

  async findAll(request = {}) {
    return await this.vestingRepository.find({ where: request });
  }

  async findOne(request = {}) {
    return await this.vestingRepository.findOne({
      where: request,
    });
  }

  defineVestingTime(type: string, start_date: Date, end_date: Date) {
    let vesting_remains = 'No info';
    let vesting_duration = 'No info';

    if (type !== EVestingContractType.UNIDENTIFIED) {
      vesting_remains = 'Ended';
      const now = Date.now();
      const startVesting = start_date.getTime();
      const endVesting = end_date.getTime();
      if (now < endVesting) {
        const remain = Math.ceil((endVesting - now) / DAY_IN_MS);
        vesting_remains = `${remain} days`;
      }
      vesting_duration =
        Math.ceil((endVesting - startVesting) / DAY_IN_MS) + ' days';
    }
    return { vesting_remains, vesting_duration };
  }

  // TODO: work through this method
  async findAllByNftAddress(dto: ListVestingDto) {
    try {
      const {
        chainId,
        nft_wallet_address,
        token_id,
        token_address: nft_address,
      } = dto;

      const vestings = await this.vestingRepository.find({
        relations: ['vesting_contract', 'nft'],
        where: {
          vesting_contract: { chain_id: chainId },
          nft: {
            address: ILike(nft_address),
            token_id,
            nft_wallet_address,
          },
        },
        order: { end_date: 'DESC' },
      });

      if (vestings.length === 0 || !vestings[0].vesting_contract)
        return { vestings: [] };

      const newVestings = [];
      for (const vesting of vestings) {
        const {
          start_date,
          end_date,
          total_vesting_amount,
          type: vestingType,
          streaming_frequency,
          claim_portal_url,
        } = vesting;

        const { address, symbol, type, token_address } =
          vesting.vesting_contract;

        const vestingTokenDecimals = await this.web3Service.getTokenDecimals(
          chainId,
          abiErc20,
          token_address,
        );

        const { nft_wallet_address } = vesting.nft;

        let claimed_amount_bn = 0n;
        let lockedBalance: number | string = 0;

        let contract;
        if (
          type !== EVestingContractType.CUSTOM &&
          type !== EVestingContractType.UNIDENTIFIED
        ) {
          let abi: ContractAbi = vestingContractAbi[type];
          if (type === EVestingContractType.SABLIER) {
            const sablierContract = await this.sablierService.findOne(
              address,
              chainId,
            );

            if (sablierContract) {
              abi = JSON.parse(sablierContract.abi_method);
            }
          }
          contract = this.web3Service.getContract(chainId, abi, address);
        }

        switch (type) {
          case EVestingContractType.SABLIER:
            const sablierVesting: TSablierVesting = await contract.methods
              .getStream(token_id)
              .call();

            if (sablierVesting.endTime !== 0) {
              const endTime = BigInt(sablierVesting.endTime);
              const startTime = BigInt(sablierVesting.startTime);
              const deposited = BigInt(sablierVesting.amounts.deposited);
              const withdrawn = BigInt(sablierVesting.amounts.withdrawn);
              const refunded = BigInt(sablierVesting.amounts.refunded);
              const vestingPeriod = endTime - startTime;
              const vestingDays = Number(vestingPeriod / BigInt(86400));
              const amountPerDay =
                vestingDays > 0 ? deposited / BigInt(vestingDays) : deposited;

              const now = BigInt(Math.floor(Date.now() / 1000));
              let correctly_claimed_amount_bn = 0n;

              if (now >= endTime) {
                correctly_claimed_amount_bn = deposited;
              } else if (now > startTime) {
                const elapsedTime = now - startTime;
                const elapsedDays = Number(elapsedTime / BigInt(86400));
                correctly_claimed_amount_bn =
                  amountPerDay * BigInt(elapsedDays);
              }

              claimed_amount_bn = correctly_claimed_amount_bn;

              const unclaimedAmount = deposited - withdrawn - refunded;

              const tokenContractData = (
                await this.moralisService.getERC20TokenContract({
                  chainId,
                  tokenAddresses: [sablierVesting?.asset],
                })
              )[0];
              let token_decimals = Number(tokenContractData?.decimals);

              if (!token_decimals) {
                token_decimals = await this.web3Service.getTokenDecimals(
                  chainId,
                  abiErc20,
                  sablierVesting?.asset,
                );
              }

              lockedBalance = Number(
                unclaimedAmount / BigInt(10 ** token_decimals),
              );
            }

            break;

          case EVestingContractType.LINEAR:
            const availableBalance: bigint = await contract.methods
              .getWithdrawableAmount(nft_wallet_address)
              .call();

            if (vestingType === EVestingType.CLIFF) {
              const now = Math.floor(Date.now() / 1000);
              const cliff: TLinearCliff = await contract.methods
                .cliffs(nft_wallet_address)
                .call();

              if (
                now < Number(cliff.unlockTime) ||
                (now >= Number(cliff.unlockTime) && availableBalance !== 0n)
              ) {
                lockedBalance = formatUnits(
                  total_vesting_amount,
                  vestingTokenDecimals,
                );
              } else {
                lockedBalance = 0;
              }
            }

            if (vestingType === EVestingType.VESTING) {
              const vestingSchedule: TLinearVesting = await contract.methods
                .vestingSchedules(nft_wallet_address)
                .call();

              if (vestingSchedule.lastClaimTime === 0n) {
                lockedBalance = formatUnits(
                  total_vesting_amount,
                  vestingTokenDecimals,
                );
              }
              if (vestingSchedule.lastClaimTime >= vestingSchedule.endTime) {
                // All vested
                lockedBalance = 0;
              }
              if (vestingSchedule.lastClaimTime < vestingSchedule.endTime) {
                const totalSteps =
                  (vestingSchedule.endTime - vestingSchedule.startTime) /
                  vestingSchedule.step;
                const stepsToClaim =
                  (vestingSchedule.lastClaimTime - vestingSchedule.startTime) /
                  vestingSchedule.step;
                claimed_amount_bn =
                  (vestingSchedule.amount / totalSteps) * stepsToClaim;
                lockedBalance = formatUnits(
                  vestingSchedule.amount - claimed_amount_bn,
                  vestingTokenDecimals,
                );
              }
            }
            break;

          case EVestingContractType.GAMIUM:
            const gamium: TGamium1Vesting | TGamium2Vesting =
              vestingType === EVestingType.GAMIUM_1
                ? await contract.methods.users1(nft_wallet_address).call()
                : await contract.methods.users2(nft_wallet_address).call();
            let claimedPercentage = 0n;
            if (gamium.claimedUnlocksCount !== 0n) {
              const claimedUnlocksCount =
                Number(gamium.claimedUnlocksCount) - 1;
              claimedPercentage = await contract.methods
                .unlockPercentages(claimedUnlocksCount)
                .call();
            }
            claimed_amount_bn =
              (BigInt(total_vesting_amount) * claimedPercentage) / 1000000n;
            lockedBalance = formatUnits(
              BigInt(total_vesting_amount) - claimed_amount_bn,
              vestingTokenDecimals,
            );
            break;

          case EVestingContractType.GENKOSHI:
            const accountStats = await contract.methods
              .getAccountStats(address)
              .call();

            claimed_amount_bn = accountStats[1];
            lockedBalance = formatUnits(
              BigInt(total_vesting_amount) - claimed_amount_bn,
              vestingTokenDecimals,
            );
            break;

          case EVestingContractType.RETROACTIVE:
            const { released }: TRetroactiveVesting = await contract.methods
              .vestings(nft_wallet_address)
              .call();
            lockedBalance = formatUnits(
              BigInt(total_vesting_amount) - released,
              vestingTokenDecimals,
            );
            break;

          case EVestingContractType.ONDO:
            const freedBalance: bigint = await contract.methods
              .getFreedBalance(nft_wallet_address)
              .call();

            lockedBalance = formatUnits(
              BigInt(total_vesting_amount) - freedBalance,
              vestingTokenDecimals,
            );
            break;

          case EVestingContractType.CUSTOM:
            lockedBalance = formatUnits(
              BigInt(total_vesting_amount),
              vestingTokenDecimals,
            );
            break;

          case EVestingContractType.UNIDENTIFIED:
            lockedBalance = EVestingType.UNIDENTIFIED;
            break;
        }

        const { vesting_remains, vesting_duration } = this.defineVestingTime(
          type,
          start_date,
          end_date,
        );

        let is_valid_vesting_contract: boolean = false;

        try {
          const abi = await this.multiChainApiService.getAbi(chainId, {
            address,
          });

          is_valid_vesting_contract = !!abi;
        } catch (error) {
          console.log(`Vesting with address ${address} is not verified`);
        }

        newVestings.push({
          type: type,
          unclaimed: lockedBalance,
          start_date,
          end_date,
          vesting_contract_address: address?.toLowerCase(),
          is_valid_vesting_contract,
          vesting_remains,
          vesting_duration,
          symbol,
          streaming_frequency,
          claim_portal_url: claim_portal_url || 'No info',
          token_address,
          total_vesting_amount: total_vesting_amount.toString(),
          human_total_vesting_amount: formatUnits(
            BigInt(total_vesting_amount),
            vestingTokenDecimals,
          ),
        });
      }

      return { vestings: newVestings };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getSablierVestingInfo(
    chain_id: string,
    contract: Contract<ContractAbi>,
    token_id: string,
  ) {
    const sablierVesting: TSablierVesting = await contract.methods
      .getStream(token_id)
      .call();
    const vestingTokenAddress: string = await contract.methods
      .getAsset(token_id)
      .call();
    const vestingTokenDecimals = await this.web3Service.getTokenDecimals(
      chain_id,
      abiErc20,
      vestingTokenAddress,
    );

    if (sablierVesting.endTime !== 0) {
      const endTime = BigInt(sablierVesting.endTime);
      const startTime = BigInt(sablierVesting.startTime);
      const deposited = BigInt(sablierVesting.amounts.deposited);
      const withdrawn = BigInt(sablierVesting.amounts.withdrawn);
      const refunded = BigInt(sablierVesting.amounts.refunded);
      const vestingPeriod = endTime - startTime;
      const vestingDays = Number(vestingPeriod / BigInt(86400));

      const unclaimedAmount = deposited - withdrawn - refunded;

      let streamingFrequencyAmount = formatUnits(
        deposited,
        vestingTokenDecimals,
      );

      if (vestingDays > 0) {
        const amountPerDay = deposited / BigInt(vestingDays);
        streamingFrequencyAmount = formatUnits(
          amountPerDay,
          vestingTokenDecimals,
        );
      }

      return {
        type: EVestingType.SABLIER,
        startTime: timestampToDate(Number(sablierVesting.startTime)),
        endTime: timestampToDate(Number(sablierVesting.endTime)),
        total_vesting_amount: sablierVesting.amounts.deposited,
        streaming_frequency:
          streamingFrequencyAmount.toFixed(2) + ' avg. per Day',
        unclaimed_amount: unclaimedAmount,
      };
    }
  }

  async addVesting(dto: AddVestingDto) {
    try {
      const {
        address,
        nft_wallet_address,
        token_id,
        claim_portal_url,
        chain_id,
      } = dto;
      const nftWallet = await this.nftService.findOne({
        nft_wallet_address,
        chain_id,
      });

      if (!nftWallet)
        throw new Error(
          `No NFT wallet with address ${nft_wallet_address} in DB!`,
        );

      nftWallet.vestings.forEach((vesting) => {
        if (
          vesting.vesting_contract.address.toLowerCase() ===
          address.toLowerCase()
        )
          throw new Error(
            `Vesting with contract address ${address} is already added to this NFT!`,
          );
      });

      const vestingContract =
        await this.vestingContractService.findOrCreate(dto);

      const { type, token_address } = vestingContract;
      const vestingTokenDecimals = await this.web3Service.getTokenDecimals(
        chain_id,
        abiErc20,
        token_address,
      );

      let contract;
      if (
        type !== EVestingContractType.CUSTOM &&
        type !== EVestingContractType.UNIDENTIFIED
      ) {
        contract = this.web3Service.getContract(
          chain_id,
          vestingContractAbi[type],
          address,
        );
      }

      const vestings = [];
      let streamingFrequencyAmount = 0;
      switch (type) {
        case EVestingContractType.SABLIER:
          let abi: ContractAbi = vestingContractAbi[type];
          const stringifiedAbiFromDb = await this.sablierService.findOne(
            dto.address,
            chain_id,
          );
          if (stringifiedAbiFromDb) {
            abi = JSON.parse(stringifiedAbiFromDb.abi_method);
          }
          const sablierContract = this.web3Service.getContract(
            chain_id,
            abi,
            dto.address,
          );
          const vestingInfo = await this.getSablierVestingInfo(
            chain_id,
            sablierContract,
            token_id,
          );
          vestings.push(vestingInfo);

          break;

        case EVestingContractType.LINEAR:
          const linearVesting: TLinearVesting = await contract.methods
            .vestingSchedules(nft_wallet_address)
            .call();

          if (linearVesting.endTime !== 0n) {
            const stepsPerDay = DAY_IN_SEC / Number(linearVesting.step);
            streamingFrequencyAmount =
              formatUnits(
                linearVesting.amount / linearVesting.step,
                vestingTokenDecimals,
              ) * stepsPerDay;
            vestings.push({
              type: EVestingType.VESTING,
              startTime: timestampToDate(Number(linearVesting.startTime)),
              endTime: timestampToDate(Number(linearVesting.endTime)),
              total_vesting_amount: linearVesting.amount,
              streaming_frequency: streamingFrequencyAmount + ' avg. per Day',
            });
          }

          const linearCliff: TLinearCliff = await contract.methods
            .cliffs(nft_wallet_address)
            .call();

          if (linearCliff.unlockTime !== 0n) {
            vestings.push({
              type: EVestingType.CLIFF,
              startTime: new Date(),
              endTime: timestampToDate(Number(linearCliff.unlockTime)),
              total_vesting_amount: linearCliff.amount,
              streaming_frequency:
                formatUnits(linearCliff.amount, vestingTokenDecimals) +
                ' at the vesting end',
            });
          }
          break;

        case EVestingContractType.GAMIUM:
          const startTime: bigint = await contract.methods.startTime().call();

          const totalUnlocksCount: bigint = await contract.methods
            .getTotalUnlocksCount()
            .call();

          const unlockPeriod: bigint = await contract.methods
            .unlockPeriods(totalUnlocksCount - 1n)
            .call();
          const endTime = timestampToDate(Number(startTime + unlockPeriod));
          const streamingFrequency = unlockPeriod / totalUnlocksCount;
          const stepsPerDay = DAY_IN_SEC / Number(streamingFrequency);

          const gamium1: TGamium1Vesting = await contract.methods
            .users1(nft_wallet_address)
            .call();

          if (gamium1.allocation !== 0n) {
            streamingFrequencyAmount =
              formatUnits(
                gamium1.allocation / totalUnlocksCount,
                vestingTokenDecimals,
              ) * stepsPerDay;

            vestings.push({
              type: EVestingType.GAMIUM_1,
              startTime: timestampToDate(Number(startTime)),
              endTime,
              total_vesting_amount: gamium1.allocation,
              streaming_frequency: streamingFrequencyAmount + ' avg. per Day',
            });
          }

          const gamium2: TGamium2Vesting = await contract.methods
            .users2(nft_wallet_address)
            .call();
          if (gamium2.allocation !== 0n) {
            streamingFrequencyAmount =
              formatUnits(
                gamium2.allocation / totalUnlocksCount,
                vestingTokenDecimals,
              ) * stepsPerDay;

            vestings.push({
              type: EVestingType.GAMIUM_2,
              startTime: timestampToDate(Number(startTime)),
              endTime,
              total_vesting_amount: gamium2.allocation,
              streaming_frequency: streamingFrequencyAmount + ' avg. per Day',
            });
          }
          break;

        case EVestingContractType.GENKOSHI:
          const genkoshi: TGenkoshiVesting = await contract.methods
            .getAccountStats(nft_wallet_address)
            .call();
          if (genkoshi['0'] !== 0n) {
            const genkoshiDates = await contract.methods
              .getClaims(NULL_ADDRESS)
              .call();
            const startTime = timestampToDate(Number(genkoshiDates[0][0]));
            const endTime = timestampToDate(Number(genkoshiDates[0].at(-1)));
            const duration = BigInt(
              genkoshiDates[0].at(-1) - genkoshiDates[0][0],
            );
            streamingFrequencyAmount =
              formatUnits(genkoshi['0'] / duration, vestingTokenDecimals) *
              DAY_IN_SEC;
            vestings.push({
              type: EVestingType.GENKOSHI,
              startTime,
              endTime,
              total_vesting_amount: genkoshi['0'],
              // streaming_frequency: genkoshiDates[0][1] - genkoshiDates[0][0],
              streaming_frequency: streamingFrequencyAmount + ' avg. per Day',
            });
          }
          break;

        case EVestingContractType.ONDO:
          const tokenContract = this.web3Service.getContract(
            chain_id,
            abiOndoToken,
            token_address,
          );
          const ondo: TOndoVesting = await tokenContract.methods
            .getVestedBalance(nft_wallet_address)
            .call();

          if (ondo['0'] !== 0n) {
            const startVesting: bigint = await tokenContract.methods
              .cliffTimestamp()
              .call();
            const lockPeriod: bigint = await tokenContract.methods
              .seedVestingPeriod()
              .call();
            const startTime = timestampToDate(Number(startVesting));
            const endTime = timestampToDate(Number(startVesting + lockPeriod));
            // deprecated by client
            // const streaming_frequency = await tokenContract.methods
            //   .tranche1VestingPeriod()
            //   .call();
            streamingFrequencyAmount =
              formatUnits(ondo['0'] / lockPeriod, vestingTokenDecimals) *
              DAY_IN_SEC;
            vestings.push({
              type: EVestingType.ONDO,
              startTime,
              endTime,
              total_vesting_amount: ondo['0'],
              streaming_frequency: streamingFrequencyAmount + ' avg. per Day',
            });
          }
          break;

        case EVestingContractType.RETROACTIVE:
          const retroactive: TRetroactiveVesting = await contract.methods
            .vestings(nft_wallet_address)
            .call();
          if (retroactive.isVerified) {
            const startVesting: bigint = await contract.methods
              .startTimestamp()
              .call();
            const duration: bigint = await contract.methods.DURATION().call();
            const startTime = timestampToDate(Number(startVesting));
            const endTime = timestampToDate(Number(startVesting + duration));
            streamingFrequencyAmount =
              formatUnits(
                retroactive.totalAmount / duration,
                vestingTokenDecimals,
              ) * DAY_IN_SEC;
            vestings.push({
              type: EVestingType.RETROACTIVE,
              startTime,
              endTime,
              total_vesting_amount: retroactive.totalAmount,
              streaming_frequency: streamingFrequencyAmount + ' avg. per Day',
            });
          }
          break;

        case EVestingContractType.CUSTOM:
          vestings.push({
            type: EVestingType.CUSTOM,
            startTime: dto.start_time,
            endTime: dto.end_time,
            total_vesting_amount: dto.unclaimed_amount,
            streaming_frequency: dto.streaming_frequency,
          });
          break;

        case EVestingContractType.UNIDENTIFIED:
          vestings.push({
            type: EVestingType.UNIDENTIFIED,
            startTime: EVestingType.UNIDENTIFIED,
            endTime: EVestingType.UNIDENTIFIED,
            total_vesting_amount: EVestingType.UNIDENTIFIED,
            streaming_frequency: EVestingType.UNIDENTIFIED,
          });
          break;
      }

      if (vestings.length === 0)
        throw new Error(`No vestings of such type in this NFT wallet!`);

      for (const vesting of vestings) {
        const vestingData = {
          nft: nftWallet,
          total_vesting_amount: vesting.total_vesting_amount,
          start_date: vesting.startTime,
          end_date: vesting.endTime,
          type: vesting.type,
          vesting_contract: vestingContract,
          streaming_frequency: vesting.streaming_frequency,
          claim_portal_url,
        };
        await this.create(vestingData);
      }

      return {
        success: true,
        data: vestingContract,
        message: `Vesting successfully added to NFT wallet ${nft_wallet_address}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Add vesting to NFT error. ${error.message}`,
      };
    }
  }
}
