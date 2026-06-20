// User Controller in NestJS
import { Controller, Get, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenTypeEnum } from 'src/common/Enum/token.enums';
import { AuthGuard } from 'src/common/guard/authentication.guard';
import type { IRequestAuth } from 'src/common/interface/request.interface';

@Controller('user')
export class UserController {
  constructor(private _userService: UserService) {}

  @Get()
  getAllUsers() {
    return this._userService.getAllUsers();
  }

  @SetMetadata('tokenType', TokenTypeEnum.ACCESS)
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: IRequestAuth) {
    return { message: 'done', user: req.user };
  }
}
