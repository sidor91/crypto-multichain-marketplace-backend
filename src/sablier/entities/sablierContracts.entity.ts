import { Column, Entity } from 'typeorm';

import { CommonColumns } from '../../@common/entities/common.entity';

@Entity({ name: 'contract_sablier' })
export class SablierContract extends CommonColumns {
  @Column({ unique: true })
  key: string;

  @Column()
  contract_address: string;

  @Column()
  abi_method: string;
}
