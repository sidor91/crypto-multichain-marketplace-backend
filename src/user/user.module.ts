import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { RtStrategy } from './strategies';
import { AtStrategy } from './strategies/at.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  controllers: [UserController],
  providers: [UserService, AtStrategy, RtStrategy],
  exports: [UserService, AtStrategy, RtStrategy],
})
export class UserModule {}
