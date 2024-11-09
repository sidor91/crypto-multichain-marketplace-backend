import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

import { CommonTokenColumns } from '../../@common/entities/commonToken.entity';
import { Vesting } from '../../vesting/entities/vesting.entity';

@Entity({ name: 'vesting_contracts' })
export class VestingContract extends CommonTokenColumns {
  @ApiProperty({
    example: '0x85b4Ce35C2e36aC6405455A3D3Ae947972864f66',
    description: 'unique erc20 address',
  })
  @Column()
  token_address: string;

  @ApiProperty({
    example: '97',
    description: 'Chain ID',
  })
  @Column()
  @IsNumberString({}, { message: 'Must be a string number' })
  chain_id: string;

  @ApiProperty({
    example: 'Linear',
    description: 'Type of vesting contract',
  })
  @Column()
  type: string;

  @OneToMany(() => Vesting, (vestings) => vestings.vesting_contract)
  @JoinColumn({ name: 'vesting_id', referencedColumnName: 'id' })
  vestings?: Vesting[];
}
