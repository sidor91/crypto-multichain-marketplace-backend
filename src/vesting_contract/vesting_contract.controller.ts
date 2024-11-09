import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/@common/decorators';

import {
  CheckVestingContractDto,
  CheckVestingContractDtoResponse,
} from './dto/check-vesting_contract.dto';
import {
  ListVestingContractDto,
  ListVestingContractDtoResponse,
} from './dto/list-vesting_contract.dto';
import { VestingContractService } from './vesting_contract.service';

@ApiTags('Vesting API')
@Controller('vesting-contract')
export class VestingContractController {
  constructor(
    private readonly vestingContractService: VestingContractService,
  ) {}

  @ApiOperation({ summary: 'Vesting Contracts list by chainId' })
  @ApiResponse({
    status: 201,
    type: ListVestingContractDtoResponse,
  })
  @Public()
  @Get('list')
  async list(@Query() dto: ListVestingContractDto) {
    const vestingContracts = await this.vestingContractService.findAll({
      chain_id: dto.chainId,
    });
    return { success: true, data: vestingContracts };
  }

  @ApiOperation({ summary: 'Check Vesting Contract type' })
  @ApiResponse({
    status: 201,
    type: CheckVestingContractDtoResponse,
  })
  @Public()
  @Post('check')
  async check(@Body() dto: CheckVestingContractDto) {
    return await this.vestingContractService.checkVestingContractType(dto);
  }
}
