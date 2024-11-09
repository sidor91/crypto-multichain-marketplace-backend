export type Payload = {
  id: string;
  address: string;
};

export type JwtPayloadWithAt = Payload & { key: string };

export type TSablierVesting = {
  sender: string;
  recipient: string;
  startTime: number;
  endTime: number;
  isCancelable: boolean;
  wasCanceled: boolean;

  asset: string;
  isDepleted: boolean;
  isStream: boolean;
  isTransferable: boolean;

  amounts: {
    deposited: string;
    withdrawn: string;
    refunded: string;
  };

  tranches: Array<{
    startTime: number;
    amount: string;
  }>;
};

export type TLinearVesting = {
  amount: bigint;
  startTime: bigint;
  endTime: bigint;
  step: bigint;
  lastClaimTime: bigint;
};

export type TLinearCliff = {
  amount: bigint;
  unlockTime: bigint;
};

export type TGamium1Vesting = {
  allocation: bigint;
  claimedUnlocksCount: bigint;
  eliminatedAfterUnlock: bigint;
};

export type TGamium2Vesting = {
  allocation: bigint;
  debt: bigint;
  claimedUnlocksCount: bigint;
  currentUnlocked: bigint;
  currentClaimed: bigint;
  totalUnlocked: bigint;
  totalClaimed: bigint;
};

export type TGenkoshiVesting = {
  '0': bigint; // allocation
  '1': bigint; // claimed
  '2': bigint; // claimable
};

export type TOndoVesting = {
  '0': bigint; // initialBalance
  '1': bigint; // amountAvailable
};

export type TRetroactiveVesting = {
  isVerified: boolean;
  totalAmount: bigint;
  released: bigint;
};

export type TMoralisTokenResponse = {
  address: string;
  address_label?: string;
  name: string;
  symbol: string;
  decimals: string;
  logo?: string;
  logo_hash?: string;
  thumbnail?: string;
  block_number?: string;
  validated?: number;
  created_at: string;
  possible_spam: boolean;
  verified_contract?: boolean;
}[];

export type TTokenDetails = {
  total_supply: number | null;
  circulating_supply: number | null;
  market_cap: number | null;
};

export type TMoralisUserTokens = {
  name: string;
  symbol: string;
  tokenAddress: { _value: string };
  logo: string;
  decimals: number;
  balance: number;
  usdValue: number;
}[];

export type TMoralisUserNfts = {
  contract_type: string;
  nft_name: string;
  nft_description: string;
  nft_image: string;
  token_id: string;
  collection_address: { _value: string };
  collection_name: string;
  collection_symbol: string;
  token_uri: string;
}[];

export type TMoralisNFTMetadata = {
  contract_type: string;
  token_address: string;
  token_id: string;
  minter_address: string;
  owner_of: string;
  symbol: string;
  token_uri: string;
  block_number_minted: string;
  nft: {
    name: string;
    description: string;
    image: string;
  };
};

export type Logger = 'error' | 'warn' | 'fatal' | 'debug' | 'verbose' | 'log';
