import {
  apiHandlers,
  AVAILABLE_CHAINS,
  linearContracts,
  networks,
  sablierInfo,
  tokens,
} from './data';
import { ChainData, ChainNumberUnionType, MultiChainData } from './type';

export default () => {
  const multiChainData: MultiChainData = new Map<
    ChainNumberUnionType,
    ChainData
  >();

  const availableChains: ChainNumberUnionType[] =
    Object.values(AVAILABLE_CHAINS);

  for (const chainNumber of availableChains) {
    const data: ChainData = {
      chain_id: chainNumber,
      linear_contract: linearContracts[chainNumber],
      network: networks[chainNumber],
      tokens: tokens[chainNumber],
      sablierInfo: sablierInfo[chainNumber],
    };
    multiChainData.set(chainNumber, data);
  }

  return { multiChainData, apiHandlers, availableChains };
};
