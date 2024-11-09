import { PartialType } from '@nestjs/swagger';

import { CreateVestingDto } from './create-vesting.dto';

export class UpdateVestingDto extends PartialType(CreateVestingDto) {}
