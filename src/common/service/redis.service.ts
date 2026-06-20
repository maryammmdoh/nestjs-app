import { Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import type { RedisClientType } from 'redis';
import { EmailEnum } from '../Enum/email.enums';

@Injectable()
export class RedisService {
  constructor(@Inject('Redis_Client') private client: RedisClientType) {}

  getBlacklistTokenKey({ userId, tokenId }: {
    userId: Types.ObjectId | string;
    tokenId: string;
  }) {
    return `blacklistToken::${userId}::${tokenId}`;
  }

  getOTPKey({ email, emailType }: { email: string; emailType: EmailEnum }) {
    return `OTP::${email}::${emailType}`;
  }

  getOTPReqNoKey({ email, emailType }: { email: string; emailType: EmailEnum }) {
    return `OTP::${email}::${emailType}::No`;
  }

  getOTPReqBlockedKey({ email, emailType }: { email: string; emailType: EmailEnum }) {
    return `OTP::${email}::${emailType}::Blocked`;
  }

  async set({ key, value, exType = 'EX', exValue = 50 }: {
    key: string;
    value: string | number;
    exType?: 'EX' | 'PX' | 'EXAT' | 'PXAT';
    exValue?: number;
  }) {
    return await this.client.set(key, value, {
      expiration: { type: exType, value: Math.floor(exValue) },
    });
  }

  async incr({ key }: { key: string }) {
    return await this.client.incr(key);
  }

  async decr({ key }: { key: string }) {
    return await this.client.decr(key);
  }

//   async hset({ fields }) {
//     return await this.client.hSet(fields);
//   }

  async update({ key, value }: { key: string; value: string | number }) {
    const exists = await this.client.exists(key);
    if (!exists) {
      throw new Error('Key does not exist --> 0');
    }
    return await this.client.set(key, value);
  }

  async remove({ keys }: { keys: string | string[] }) {
    return await this.client.del(keys);
  }

  async ttl({ key }: { key: string }) {
    return await this.client.ttl(key);
  }

  async setExpire({ key, seconds }: { key: string; seconds: number }) {
    return await this.client.expire(key, seconds);
  }

  async removeExpire({ key }: { key: string }) {
    return await this.client.persist(key);
  }

  async get({ key }: { key: string }) {
    return await this.client.get(key);
  }

  async mget({ keys }: { keys: string[] }) {
    return await this.client.mGet(keys);
  }

  async exists({ key }: { key: string }) {
    return await this.client.exists(key);
  }

  getFCMTokenKey(userId: Types.ObjectId | string) {
    return `FCMTokens::${userId}`;
  }

  async addFCMTokenToSet(userId: Types.ObjectId | string, fcmToken: string) {
    const key = this.getFCMTokenKey(userId);
    return await this.client.sAdd(key, fcmToken);
  }

  async getMemberFCMTokens(userId: Types.ObjectId | string) {
    const key = this.getFCMTokenKey(userId);
    return await this.client.sMembers(key);
  }

  getSocketIoKey(userId: Types.ObjectId | string) {
    return `SocketIoUserIds::${userId}`;
  }

  async addSocketIoIdToSet(userId: Types.ObjectId | string, SocketId: string) {
    const key = this.getSocketIoKey(userId);
    return await this.client.sAdd(key, SocketId);
  }

  async removeSocketId(userId: Types.ObjectId | string, SocketId: string) {
    const key = this.getSocketIoKey(userId);
    return await this.client.sRem(key, SocketId);
  }

  async getMemberSocketIoIds(userId: Types.ObjectId | string) {
    const key = this.getSocketIoKey(userId);
    return await this.client.sMembers(key);
  }

}
