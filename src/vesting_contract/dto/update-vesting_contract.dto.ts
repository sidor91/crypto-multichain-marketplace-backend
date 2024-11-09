import { PartialType } from '@nestjs/swagger';

import { CreateVestingContractDto } from './create-vesting_contract.dto';

export class UpdateVestingContractDto extends PartialType(
  CreateVestingContractDto,
) {}
