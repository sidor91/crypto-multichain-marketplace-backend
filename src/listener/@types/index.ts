interface OrderEventWithdrawalData {
  withdrawAmount: bigint;
  feeAmount: bigint;
  refundedTokens: bigint;
}

interface OrderEventFillData {
  fulfiller: string;
  tokensReceived: bigint;
  tokenFulfilled: bigint;
  pricePerToken: bigint;
}

interface OrderCreatedEventData {
  order: OrderEventData;
  withdrawal: OrderEventWithdrawalData;
  orderId: string;
  fill: OrderEventFillData;
  newPrice?: bigint;
}

export enum OrderState {
  OPEN = 0,
  FULFILLED = 1,
  CANCELLED = 2,
}

export interface OrderEventData {
  requester: string;
  whitelistedAddress: string;
  tokenAddress: string;
  tokenId: bigint;
  initialTokens: bigint;
  availableTokens: bigint;
  requestedTokenAddress: string;
  requestedTokenAmount: bigint;
  fulfilledToken: bigint;
  pricePerToken: bigint;
  partiallyFillable: boolean;
  isNFT: boolean;
  state: OrderState;
}

export interface OrderEvent {
  address: string;
  topics: string[];
  data: string;
  blockNumber: bigint;
  transactionHash: string;
  transactionIndex: bigint;
  blockHash: string;
  logIndex: bigint;
  removed: boolean;
  returnValues: OrderCreatedEventData;
  event: string;
  signature: string;
  raw: {
    data: string;
    topics: string[];
  };
}
