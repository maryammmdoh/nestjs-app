import { Injectable } from '@nestjs/common';
import { ENCRYPTION_KEY, SALT_ROUNDS } from '../../../config/config.service.js';
import CryptoJS from 'crypto-js';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityService {
  private ENCRYPTION_KEY: string;
  private SALT_ROUNDS: number;
  constructor(private _configService: ConfigService) {
    this.ENCRYPTION_KEY = this._configService.get<string>('ENCRYPTION_KEY') as string;
    this.SALT_ROUNDS = this._configService.get<number>('SALT_ROUNDS') as number;
  }

  encryptvalue({
    value,
    key = this.ENCRYPTION_KEY,
  }: {
    value: string;
    key?: string;
  }) {
    return CryptoJS.AES.encrypt(value, key).toString();
  }

  decryptValue({
    encryptedValue,
    key = this.ENCRYPTION_KEY,
  }: {
    encryptedValue: string;
    key?: string;
  }) {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedValue;
  }

  async hashOperation({
    plainValue,
    rounds = Number(this._configService.get<string>('SALT_ROUNDS')),
  }: {
    plainValue: string;
    rounds?: number;
  }) {
    return await hash(plainValue, rounds);
  }
  
  async compareOperation({
    plainValue,
    hashvalue,
  }: {
    plainValue: string;
    hashvalue: string;
  }) {
    return await compare(plainValue, hashvalue);
  }
}
