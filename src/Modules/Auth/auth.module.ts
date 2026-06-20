import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../User/user.module';
import { UserRepo } from 'src/Repo/user.repo';
import UserModel from './../../model/User.model';
import { EmailService } from 'src/common/service/email.service';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from 'src/common/service/redis.service';
import { TokenService } from 'src/Repo/token.service';
import { JwtService } from '@nestjs/jwt';
import { SecurityService } from 'src/common/module/security/security.service';


@Module({
  imports: [UserModel],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'Redis_Client',
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          url: configService.get<string>('REDIS_URL'),
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
        console.log('Redis client connected successfully');
        return client;
        },
        inject: [ConfigService],
    },
    RedisService,
    EmailService, 
    ConfigService,
    TokenService,
    UserRepo,
    JwtService,
    SecurityService,
  ],
  exports: [AuthService,TokenService],
})
export class AuthModule {}
