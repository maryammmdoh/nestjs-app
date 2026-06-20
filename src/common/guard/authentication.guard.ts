import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { TokenService } from 'src/Repo/token.service';
import type { IRequestAuth } from 'src/common/interface/request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private _tokenService: TokenService,
    private _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let authorization: string | undefined;
    let req!: IRequestAuth;

    const contextType = context.getType();

    switch (contextType) {
      case 'http':
        req = context.switchToHttp().getRequest();
        authorization = req.headers.authorization;
        break;

      default:
        break;
    }

    if (!authorization) {
      throw new UnauthorizedException('you need to login first');
    }

    const [BearerKey, token] = authorization.split(' ');

    if (BearerKey != 'Bearer') {
      throw new BadRequestException('invalid bearer key');
    }

    if (!token) {
      throw new UnauthorizedException('you need to login first');
    }

    const tokenType = this._reflector.getAllAndOverride('tokenType', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user, verifiedToken } = await this._tokenService.checkToken(token, tokenType);

    req.user = user;
    req.verifiedToken = verifiedToken;

    return true;
  }
}
