import { EVestingContractType } from 'src/@enums';

// TODO: find out how to get rif of keeping vesting methods as const because all ABI are different
export const vestingMethods = {
  [EVestingContractType.SABLIER]: [
    {
      inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
      name: 'getStream',
      outputs: [
        {
          components: [
            { internalType: 'address', name: 'sender', type: 'address' },
            { internalType: 'address', name: 'recipient', type: 'address' },
            { internalType: 'uint40', name: 'startTime', type: 'uint40' },
            { internalType: 'uint40', name: 'endTime', type: 'uint40' },
            { internalType: 'bool', name: 'isCancelable', type: 'bool' },
            { internalType: 'bool', name: 'wasCanceled', type: 'bool' },
            {
              internalType: 'contract IERC20',
              name: 'asset',
              type: 'address',
            },
            { internalType: 'bool', name: 'isDepleted', type: 'bool' },
            { internalType: 'bool', name: 'isStream', type: 'bool' },
            { internalType: 'bool', name: 'isTransferable', type: 'bool' },
            {
              components: [
                {
                  internalType: 'uint128',
                  name: 'deposited',
                  type: 'uint128',
                },
                {
                  internalType: 'uint128',
                  name: 'withdrawn',
                  type: 'uint128',
                },
                {
                  internalType: 'uint128',
                  name: 'refunded',
                  type: 'uint128',
                },
              ],
              internalType: 'struct Lockup.Amounts',
              name: 'amounts',
              type: 'tuple',
            },
            {
              components: [
                {
                  internalType: 'uint128',
                  name: 'amount',
                  type: 'uint128',
                },
                {
                  internalType: 'uint40',
                  name: 'timestamp',
                  type: 'uint40',
                },
              ],
              internalType: 'struct LockupTranched.Tranche[]',
              name: 'tranches',
              type: 'tuple[]',
            },
          ],
          internalType: 'struct LockupTranched.StreamLT',
          name: 'stream',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
  [EVestingContractType.LINEAR]: [
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'cliffs',
      outputs: [
        {
          internalType: 'uint128',
          name: 'amount',
          type: 'uint128',
        },
        {
          internalType: 'uint32',
          name: 'unlockTime',
          type: 'uint32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
      ],
      name: 'getWithdrawableAmount',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'vestingSchedules',
      outputs: [
        {
          internalType: 'uint128',
          name: 'amount',
          type: 'uint128',
        },
        {
          internalType: 'uint32',
          name: 'startTime',
          type: 'uint32',
        },
        {
          internalType: 'uint32',
          name: 'endTime',
          type: 'uint32',
        },
        {
          internalType: 'uint32',
          name: 'step',
          type: 'uint32',
        },
        {
          internalType: 'uint32',
          name: 'lastClaimTime',
          type: 'uint32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  [EVestingContractType.GENKOSHI]: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'getAccountStats',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'idx',
          type: 'uint256',
        },
      ],
      name: 'claim',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'claimAll',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  [EVestingContractType.GAMIUM]: [
    {
      inputs: [],
      name: 'claimUser1',
      outputs: [
        {
          internalType: 'uint120',
          name: 'amountToClaim',
          type: 'uint120',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint120',
          name: 'extraAmountToClaim',
          type: 'uint120',
        },
      ],
      name: 'claimUser2',
      outputs: [
        {
          internalType: 'uint120',
          name: 'amountToClaim',
          type: 'uint120',
        },
        {
          internalType: 'uint120',
          name: 'baseClaimAmount',
          type: 'uint120',
        },
        {
          internalType: 'uint120',
          name: 'currentUnlocked',
          type: 'uint120',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'users1',
      outputs: [
        {
          internalType: 'uint16',
          name: 'claimedUnlocksCount',
          type: 'uint16',
        },
        {
          internalType: 'uint16',
          name: 'eliminatedAfterUnlock',
          type: 'uint16',
        },
        {
          internalType: 'uint120',
          name: 'allocation',
          type: 'uint120',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'users2',
      outputs: [
        {
          internalType: 'uint120',
          name: 'allocation',
          type: 'uint120',
        },
        {
          internalType: 'uint120',
          name: 'debt',
          type: 'uint120',
        },
        {
          internalType: 'uint16',
          name: 'claimedUnlocksCount',
          type: 'uint16',
        },
        {
          internalType: 'uint120',
          name: 'currentUnlocked',
          type: 'uint120',
        },
        {
          internalType: 'uint120',
          name: 'currentClaimed',
          type: 'uint120',
        },
        {
          internalType: 'uint120',
          name: 'totalUnlocked',
          type: 'uint120',
        },
        {
          internalType: 'uint120',
          name: 'totalClaimed',
          type: 'uint120',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
  [EVestingContractType.RETROACTIVE]: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'claimReward',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'vestedAmount',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'vestings',
      outputs: [
        {
          internalType: 'bool',
          name: 'isVerified',
          type: 'bool',
        },
        {
          internalType: 'uint120',
          name: 'totalAmount',
          type: 'uint120',
        },
        {
          internalType: 'uint120',
          name: 'released',
          type: 'uint120',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
  [EVestingContractType.ONDO]: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'index',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'bytes32[]',
          name: 'merkleProof',
          type: 'bytes32[]',
        },
      ],
      name: 'claim',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
};
