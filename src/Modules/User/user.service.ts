import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../Repo/user.repo';

@Injectable()
export class UserService {
  constructor(private _userRepo: UserRepo) {}

  async getAllUsers() {
    return await this._userRepo.find({ filter: {} });
  }
}
