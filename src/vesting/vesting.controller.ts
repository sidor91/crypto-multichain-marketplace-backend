import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/@common/decorators';

import { AddVestingDto } from './dto/add-vesting.dto';
import { ListVestingDto, ListVestingDtoResponse } from './dto/list-vesting.dto';
import { VestingService } from './vesting.service';

@ApiTags('Vesting API')
@Controller('vesting')
export class VestingController {
  constructor(private readonly vestingService: VestingService) {}

  @ApiOperation({ summary: 'List vestings by nft address' })
  @ApiResponse({
    status: 200,
    type: ListVestingDtoResponse,
  })
  @Get('/list')
  @Public()
  async findAll(@Query() dto: ListVestingDto) {
    const vestings = await this.vestingService.findAllByNftAddress(dto);
    return {
      success: true,
      data: vestings,
    };
  }

  @ApiOperation({ summary: 'Add vesting to NFT wallet' })
  @ApiResponse({
    status: 201,
    // type: ListVestingDtoResponse,
  })
  @Post('add')
  async addVesting(@Body() dto: AddVestingDto) {
    return await this.vestingService.addVesting(dto);
  }
}
