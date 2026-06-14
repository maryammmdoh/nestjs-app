// User Module in NestJS
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepo } from '../../Repo/user.repo';
import { UserController } from './user.controller';
import UserModel from './../../model/User.model';

@Module({
  imports: [UserModel],
  controllers: [UserController],
  providers: [UserService, UserRepo],
  exports: [UserService, UserRepo],
})
export class UserModule {}
