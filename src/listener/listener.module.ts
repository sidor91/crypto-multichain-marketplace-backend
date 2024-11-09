import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MoralisModule } from 'src/moralis/moralis.module';
import { MultiChainModule } from 'src/multichain/multichain.module';
import { NftModule } from 'src/nft/nft.module';
import { Order } from 'src/order/entities/order.entity';
import { OrderModule } from 'src/order/order.module';
import { SablierModule } from 'src/sablier/sablier.module';
import { StartBlockModule } from 'src/start_block/start_block.module';
import { TokenModule } from 'src/token/token.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UserModule } from 'src/user/user.module';
import { Web3Module } from 'src/web3/web3.module';

import { ListenerService } from './listener.service';
import { CreatingService } from './logic/creating.service';
import { PurchaseService } from './logic/purchase.service';
import { UpdateService } from './logic/update.service';
import { WithdrawalService } from './logic/withdrawal.service';
import { EventsService } from './services/events.service';
import { UtilsService } from './utils.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ConfigModule,
    Web3Module,
    StartBlockModule,
    UserModule,
    OrderModule,
    TokenModule,
    NftModule,
    TransactionModule,
    MoralisModule,
    SablierModule,
    MultiChainModule,
  ],
  providers: [
    ListenerService,
    EventsService,
    CreatingService,
    PurchaseService,
    UpdateService,
    WithdrawalService,
    UtilsService,
  ],
})
export class ListenerModule {}
