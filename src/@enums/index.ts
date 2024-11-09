export enum EVestingType {
  SABLIER = 'SABLIER',
  VESTING = 'VESTING',
  CLIFF = 'CLIFF',
  GAMIUM_1 = 'GAMIUM_1',
  GAMIUM_2 = 'GAMIUM_2',
  GENKOSHI = 'GENKOSHI',
  RETROACTIVE = 'RETROACTIVE',
  ONDO = 'ONDO',
  CUSTOM = 'CUSTOM',
  UNIDENTIFIED = 'No info',
}

export enum EVestingContractType {
  SABLIER = 'SABLIER',
  LINEAR = 'LINEAR',
  GAMIUM = 'GAMIUM',
  GENKOSHI = 'GENKOSHI',
  ONDO = 'ONDO',
  RETROACTIVE = 'RETROACTIVE',
  CUSTOM = 'CUSTOM',
  UNIDENTIFIED = 'UNIDENTIFIED',
}

export enum OrderStatusType {
  ACTIVE = 'Active',
  SOLD = 'Sold',
  CANCELED = 'Canceled',
  PENDING = 'Pending',
}

export enum ETransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum ELinearEventsType {
  CREATE_ORDER = 'OrderCreated',
  BUY_ORDER = 'OrderFulfilled',
  SETTLED_TOKEN = 'OrderSettled',
  UPDATE_PRICE = 'OrderPriceUpdated',
}

export enum EOrderType {
  NFT = 'NFT Key',
  TOKEN = 'Token',
}
