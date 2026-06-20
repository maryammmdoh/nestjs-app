import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './Modules/User/user.module';
import { UserController } from './Modules/User/user.controller';
import { User } from './model/User.model';
import { AuthModule } from './Modules/Auth/auth.module';
import { UserService } from './Modules/User/user.service';
import { Connection } from 'mongoose';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.dev', '.env.prod'],
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL_LOCAL'),
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => console.log('DB connected'));
          connection.on('open', () => console.log('DB connection open'));
          connection.on('disconnected', () => console.log('DB disconnected'));
          connection.on('reconnected', () => console.log('DB reconnected'));
          connection.on('disconnecting', () => console.log('DB disconnecting'));

          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    // MongooseModule.forRoot(process.env.DB_URL_LOCAL as string, {
    //   onConnectionCreate: (connection: Connection) => {
    //     connection.on('connected', () => console.log('DB connected'));
    //     connection.on('open', () => console.log('DB connection open'));
    //     connection.on('disconnected', () => console.log('DB disconnected'));
    //     connection.on('reconnected', () => console.log('DB reconnected'));
    //     connection.on('disconnecting', () => console.log('DB disconnecting'));

    //     return connection;
    //   },
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
