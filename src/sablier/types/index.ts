export type InternalTx = {
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  input: string;
  type: string;
  gas: string;
  gasUsed: string;
  isError: string;
  errCode: string;
};

type CommonTxListInfo = {
  status: '0' | '1';
  message: string;
};

export type TxListInternalResponse = CommonTxListInfo & {
  result: InternalTx[];
};

export type NormalTx = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
};

export type TxListResponse = CommonTxListInfo & {
  result: NormalTx[];
};
