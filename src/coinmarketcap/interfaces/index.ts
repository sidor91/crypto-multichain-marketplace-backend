export interface CryptoData {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
  data: {
    [id: string]: TokenData;
  };
}

export interface TokenData {
  id: number;
  name: string;
  symbol: string;
  category: string;
  description: string;
  slug: string;
  logo: string;
  subreddit: string;
  notice: string;
  tags: string[];
  tag_names: string[];
  tag_groups: string[];
  urls: {
    website: string[];
    twitter: string[];
    message_board: string[];
    chat: string[];
    facebook: string[];
    explorer: string[];
    reddit: string[];
    technical_doc: string[];
    source_code: string[];
    announcement: string[];
  };
  platform: Platform;
  date_added: string;
  twitter_username: string;
  is_hidden: number;
  date_launched: string | null;
  contract_address: ContractAddress[];
  self_reported_circulating_supply: number;
  self_reported_tags: string | null;
  self_reported_market_cap: number;
  infinite_supply: boolean;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  symbol: string;
  token_address: string;
}

export interface ContractAddress {
  contract_address: string;
  platform: {
    name: string;
    coin: {
      id: string;
      name: string;
      symbol: string;
      slug: string;
    };
  };
}
