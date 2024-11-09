import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonColumns } from '../../@common/entities/common.entity';
import { Nft } from '../../nft/entities/nft.entity';
import { bigIntTransformer } from '../../utils';
import { VestingContract } from '../../vesting_contract/entities/vesting_contract.entity';

@Entity({ name: 'vestings' })
export class Vesting extends CommonColumns {
  @ApiProperty({
    example: '2024-03-02 08:13:03.743484+03',
    description: 'End of vesting date',
  })
  @Column({ type: 'timestamptz' })
  start_date: Date;

  @ApiProperty({
    example: '2024-04-02 08:13:03.743484+03',
    description: 'End of vesting date',
  })
  @Column({ type: 'timestamptz' })
  end_date: Date;

  @ApiProperty({
    example: 456378n,
    description: 'Amount of vesting remain',
  })
  @Column({
    default: 0n,
    type: 'decimal',
    transformer: bigIntTransformer,
  })
  total_vesting_amount: bigint;

  @ApiProperty({
    example: 'VESTING',
    description: 'Type of vesting',
  })
  @Column()
  type: string;

  @ApiProperty({
    example: '1 avg. per Day',
    description: 'Streaming frequency',
  })
  @Column()
  streaming_frequency: string;

  @ApiProperty({
    example: 'Some URL',
    description: 'Claim portal url',
  })
  @Column()
  claim_portal_url: string;

  @ManyToOne(() => Nft, (nft) => nft.vestings)
  @JoinColumn({ name: 'nft_id', referencedColumnName: 'id' })
  nft: Nft;

  @ManyToOne(
    () => VestingContract,
    (vesting_contract) => vesting_contract.vestings,
  )
  @JoinColumn({ name: 'vesting_contract_id', referencedColumnName: 'id' })
  vesting_contract: VestingContract;
}
