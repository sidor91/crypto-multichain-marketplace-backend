export interface getOfferTokenPriceInUsdtAndNativeDto {
  offer_price: bigint;
  price_per_token: bigint;
  chain_id: string;
  token_address: string;
  isNft: boolean;
}

export interface getOfferTokenPriceInUsdtAndNativeResponse {
  offer_price_usdt: number;
  offer_price_native: number;
  price_per_token_usdt: number;
  price_per_token_native: number;
  token_market_price_usdt: number | null;
  token_market_price_native: number | null;
  delta: number | null;
}
