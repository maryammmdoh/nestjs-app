import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../User/user.module';
import { UserRepo } from 'src/Repo/user.repo';
import UserModel from './../../model/User.model';

@Module({
  imports: [UserModel],
  controllers: [AuthController],
  providers: [AuthService, UserRepo],
  exports: [AuthService],
})
export class AuthModule {}
