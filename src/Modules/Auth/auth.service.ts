// Auth Service in NestJS
import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../Repo/user.repo';

@Injectable()
export class AuthService {
  constructor(private _userRepo: UserRepo) {}
  getAuthPage() {
    return 'auth page';
  }

  async signup(body: any) {
    const user = await this._userRepo.create({data: {
        userName: body.userName,
        email: body.email,
        password: body.password
      }});

    return {
      message: 'signup successful',
      data: user,
    };
  }
}
