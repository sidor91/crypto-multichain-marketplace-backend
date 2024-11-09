import { Injectable } from '@nestjs/common';
import { Contract, ContractAbi, Web3 } from 'web3';

import { MultiChainDataService } from 'src/multichain/multichain-data.service';
import { sleep } from 'src/utils';

import { weiUnitsMap } from './weiUnits';

@Injectable()
export class Web3Service {
  private readonly rpcForUtilsMethods: string = 'https://rpc.sepolia.org';
  private readonly web3ForUtilsMethods: Web3;

  constructor(private readonly multiChainDataService: MultiChainDataService) {
    this.web3ForUtilsMethods = new Web3(this.rpcForUtilsMethods);
  }

  private getInstance(chainId: string): Web3 {
    const chainData = this.multiChainDataService.getChainData(chainId);
    const { rpc } = chainData.network;
    return new Web3(rpc);
  }

  async getLatestBlock(chainId: string) {
    const web3 = this.getInstance(chainId);
    return await web3.eth.getBlockNumber();
  }

  public getContract(
    chainId: string,
    abi: ContractAbi,
    address: string,
  ): Contract<ContractAbi> {
    const web3 = this.getInstance(chainId);
    return new Contract(abi, address, web3);
  }

  async getEventsByBlock(
    chainId: string,
    blockNumber: number,
    targetAddress: string,
  ) {
    try {
      const web3 = this.getInstance(chainId);
      const block = await web3.eth.getBlock(blockNumber, true);
      const events = [];

      for (const tx of block.transactions) {
        if (typeof tx !== 'string' && tx.hash) {
          const receipt = await web3.eth.getTransactionReceipt(tx.hash);
          if (receipt && receipt.logs) {
            for (const log of receipt.logs) {
              if (receipt.from.toLowerCase() === targetAddress.toLowerCase()) {
                events.push(log);
              }
            }
          }
        }
      }

      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getTransactionInfo(chainId: string, txHash: string) {
    try {
      const web3 = this.getInstance(chainId);
      const hash = await web3.eth.getTransaction(txHash);
      return hash;
    } catch (error) {
      return null;
    }
  }

  async checkEvent(
    contract: Contract<any>,
    event: string,
    fromBlock: number,
    toBlock: number,
  ): Promise<Array<any>> {
    let retryCount = 0;

    const getEvents = async () => {
      try {
        return await contract.getPastEvents(event, {
          fromBlock,
          toBlock,
        });
      } catch (err) {
        retryCount++;
        if (retryCount >= 5) {
          throw new Error(`Check event retries exceeded limit: ${err}`);
        }
        await sleep(1000);
        return getEvents();
      }
    };

    return getEvents();
  }

  // TODO check how to deal with Solana
  async checkIsContractAddress(chainId: string, address: string) {
    try {
      const web3 = this.getInstance(chainId);
      const code = await web3.eth.getCode(address);
      return code !== '0x';
    } catch (error) {
      return false;
    }
  }

  async getTokenDecimals(
    chainId: string,
    abi: ContractAbi,
    address: string,
  ): Promise<number> {
    const contract = this.getContract(chainId, abi, address);
    const decimal = await contract.methods.decimals().call();
    return Number(decimal);
  }

  async getName(
    chainId: string,
    abi: ContractAbi,
    address: string,
  ): Promise<string> {
    const contract = this.getContract(chainId, abi, address);
    return await contract.methods.name().call();
  }

  async getSymbol(
    chainId: string,
    abi: ContractAbi,
    address: string,
  ): Promise<string> {
    const contract = this.getContract(chainId, abi, address);
    return await contract.methods.symbol().call();
  }

  async getTotalSupply(
    chainId: string,
    abi: ContractAbi,
    address: string,
  ): Promise<bigint> {
    const contract = this.getContract(chainId, abi, address);
    return await contract.methods.totalSupply().call();
  }

  public fromWei(value: bigint, decimals: number) {
    return this.web3ForUtilsMethods.utils.fromWei(value, weiUnitsMap[decimals]);
  }

  public toWei(value: bigint, decimals: number) {
    return this.web3ForUtilsMethods.utils.toWei(value, weiUnitsMap[decimals]);
  }
}
