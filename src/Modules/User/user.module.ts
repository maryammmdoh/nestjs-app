import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepo } from '../../Repo/user.repo';
import { UserController } from './user.controller';
import UserModel from './../../model/User.model';
import { AuthModule } from '../Auth/auth.module';

@Module({
  imports: [UserModel, AuthModule],
  controllers: [UserController],
  providers: [UserService, UserRepo],
  // exports: [UserService, UserRepo],
})
export class UserModule {}
