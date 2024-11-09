import { EVestingContractType } from 'src/@enums';

import * as abiGamiumVesting from './GamiumVesting.json';
import * as abiGenkoshiVesting from './GenkoshiVesting.json';
import * as abiLinearVesting from './LinearVesting.json';
import * as abiOndoVesting from './OndoVesting.json';
import * as abiRetroactiveVesting from './RetroactiveVesting.json';
import * as abiSablier from './Sablier.json';

export const vestingContractAbi = {
  [EVestingContractType.SABLIER]: abiSablier,
  [EVestingContractType.LINEAR]: abiLinearVesting,
  [EVestingContractType.GAMIUM]: abiGamiumVesting,
  [EVestingContractType.GENKOSHI]: abiGenkoshiVesting,
  [EVestingContractType.RETROACTIVE]: abiRetroactiveVesting,
  [EVestingContractType.ONDO]: abiOndoVesting,
};
