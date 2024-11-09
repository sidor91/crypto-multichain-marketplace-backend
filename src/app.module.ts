import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AtGuard } from './@common/guards';
import { TryCatchInterceptor } from './@common/interceptors/try_catch.interceptor';
import { AppConfig, DatabaseConfig, MultiChainConfig } from './@config';
import { RequestLogger, TypeOrmLogger } from './@config/logger';
import { AnkrModule } from './ankr/ankr.module';
import { AppController } from './app.controller';
import { CoinMarketCapModule } from './coinmarketcap/coinmarketcap.module';
import { ListenerModule } from './listener/listener.module';
import { MoralisModule } from './moralis/moralis.module';
import { MultiChainModule } from './multichain/multichain.module';
import { NftModule } from './nft/nft.module';
import { OrderModule } from './order/order.module';
import { SablierModule } from './sablier/sablier.module';
import { FilterSortModule } from './sortingAndFiltering/filter-sort.module';
import { StartBlockModule } from './start_block/start_block.module';
import { TokenModule } from './token/token.module';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';
import { VestingModule } from './vesting/vesting.module';
import { VestingContractModule } from './vesting_contract/vesting_contract.module';
import { Web3Module } from './web3/web3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig, DatabaseConfig, MultiChainConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const options = {
          logger: new TypeOrmLogger(),
          ...configService.get('typeorm'),
        };
        return options;
      },
    }),
    Web3Module,
    MoralisModule,
    CoinMarketCapModule,
    UserModule,
    NftModule,
    TokenModule,
    VestingModule,
    VestingContractModule,
    OrderModule,
    MultiChainModule,
    TransactionModule,
    FilterSortModule,
    ListenerModule,
    StartBlockModule,
    AnkrModule,
    SablierModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TryCatchInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLogger).forRoutes('*');
  }
}
