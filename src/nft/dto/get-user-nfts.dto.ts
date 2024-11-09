import { ApiProperty } from '@nestjs/swagger';

export class GetUserNFTsResponse {
  @ApiProperty({
    example: true,
    description: 'success status',
  })
  readonly success: boolean;

  @ApiProperty({
    example: [
      {
        contract_type: 'ERC721',
        nft_name: "Coolman's Universe #9366",
        nft_description:
          "Spesh is looking for his best friend throughout Coolman's Universe. To travel through this universe, Spesh uses a surfboard and a compass. This compass is no ordinary compass. Not only does this compass point Spesh in the right direction to find his friend, it also tracks the path that Spesh's friend has taken. As Spesh follows his compass (while surfing Coolman's Universe), he finds himself exploring worlds that he's never experienced.",
        nft_image:
          'ipfs://QmdU49poCm6GKrp4Qbir8KSDTtA8W2641p1XTRvX3dJX5u/9366.png',
        token_id: '9366',
        collection_address: '0xe5a1b15ef85243be9108a977abb8217d9902780b',
        collection_name: 'APE',
        collection_symbol: 'APE',
        token_uri:
          'https://ipfs.moralis.io:2053/ipfs/QmbveAod8raJyhDJYJd3E4pAiXdMcVQn4GC3bejqesdobd/9366',
        nftInDb: {
          nft_id: '99ff87e1-47e2-42ca-9ed4-05f7e9b960f7',
          project_name: 'Crypto multichain marketpalce',
          nft_wallet_address: '0x0',
        },
      },
      {
        contract_type: 'ERC721',
        nft_name: 'DeGod #6752',
        nft_description: '10,000 of the most degenerate gods in the universe.',
        nft_image: 'https://metadata.degods.com/g/6751-s3-male.png',
        token_id: '6752',
        collection_address: '0xe5a1b15ef85243be9108a977abb8217d9902780b',
        collection_name: 'APE',
        collection_symbol: 'APE',
        token_uri: 'https://metadata.degods.com/g/6751.json',
        nftInDb: null,
      },
      {
        contract_type: 'ERC721',
        nft_name: 'Lil Pudgy #21605',
        nft_description:
          'Lil Pudgys are a collection of 22,222 randomly generated NFTs minted on Ethereum.',
        nft_image: 'https://api.pudgypenguins.io/lil/image/21605',
        token_id: '21605',
        collection_address: '0xe5a1b15ef85243be9108a977abb8217d9902780b',
        collection_name: 'APE',
        collection_symbol: 'APE',
        token_uri: 'https://api.pudgypenguins.io/lil/21605',
        nftInDb: {
          nft_id: '4c10d4b2-cbe4-406f-b102-01cf0fbfb1bd',
          project_name: 'Carrot',
          nft_wallet_address: '0xCEf43395345af8809F4Ef74Cb3881d6B961A58dD',
          vestings: [
            {
              unclaimed: 1100,
              start_date: '2024-03-28T12:35:35.000Z',
              end_date: '2024-04-28T12:35:35.000Z',
              vesting_contract_address:
                '0xa7BD4A0f5F9254815E45C271f0cd44140aa5FFea',
              vesting_remains: 'Ended',
              vesting_duration: '31 days',
              symbol: 'Lina',
              streaming_frequency: '10 avg. per Day',
              claim_portal_url: 'https://www.google.com/',
              token_address: '0xa41627CEfFF7F0b34854382abd72Aa18482EBb1E',
              total_vesting_amount: '1100000000000000000000',
              human_total_vesting_amount: 1100,
            },
          ],
        },
      },
    ],

    description: 'NFTs page data',
    type: Object,
  })
  readonly data: object[];

  @ApiProperty({
    example: 36,
    description: 'total elements',
  })
  readonly totalElements: number;

  @ApiProperty({
    example: 36,
    description: 'native token to usdt rate',
  })
  readonly native_to_usdt_rate: number;
}
