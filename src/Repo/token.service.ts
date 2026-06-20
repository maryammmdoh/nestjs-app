import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignOptions, JwtPayload } from 'jsonwebtoken';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import crypto, { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/common/service/redis.service';
import { UserRepo } from './user.repo';
import { RoleEnum } from 'src/common/Enum/user.enums';
import { IHUser } from 'src/model/User.model';
import { TokenTypeEnum } from 'src/common/Enum/token.enums';

@Injectable()
export class TokenService {
  private SIGNATURE_KEY_USER: string;
  private SIGNATURE_KEY_USER_REFRESH: string;
  private SIGNATURE_KEY_ADMIN: string;
  private SIGNATURE_KEY_ADMIN_REFRESH: string;
  constructor(
    private _configService: ConfigService,
    private _redisService: RedisService,
    private _userRepo: UserRepo,
    private _jwtService: JwtService,
  ) {
    this.SIGNATURE_KEY_USER = this._configService.get<string>(
      'SIGNATURE_KEY_USER',
    ) as string;
    this.SIGNATURE_KEY_USER_REFRESH = this._configService.get<string>(
      'SIGNATURE_KEY_USER_REFRESH',
    ) as string;
    this.SIGNATURE_KEY_ADMIN = this._configService.get<string>(
      'SIGNATURE_KEY_ADMIN',
    ) as string;
    this.SIGNATURE_KEY_ADMIN_REFRESH = this._configService.get<string>(
      'SIGNATURE_KEY_ADMIN_REFRESH',
    ) as string;
  }
  getSignatureKeyByRole(role: RoleEnum = RoleEnum.User): {
    refreshSignatureKey: string;
    accessSignatureKey: string;
  } {
    let refreshSignatureKey = '';
    let accessSignatureKey = '';
    switch (role) {
      case RoleEnum.User:
        refreshSignatureKey = this.SIGNATURE_KEY_USER_REFRESH;
        accessSignatureKey = this.SIGNATURE_KEY_USER;
        break;
      case RoleEnum.Admin:
        refreshSignatureKey = this.SIGNATURE_KEY_ADMIN_REFRESH;
        accessSignatureKey = this.SIGNATURE_KEY_ADMIN;
        break;
    }
    return { refreshSignatureKey, accessSignatureKey };
  }

  generateToken({
    payload = {},
    signatureKey,
    options = {},
  }: {
    payload?: object;
    signatureKey: string;
    options?: JwtSignOptions;
  }) {
    return this._jwtService.sign(payload, { secret: signatureKey, ...options });
  }

  verifyToken({
    token,
    signatureKey,
  }: {
    token: string;
    signatureKey: string;
  }) {
    try {
      return this._jwtService.verify(token, { secret: signatureKey });
    } catch (error) {
      throw error;
    }
  }

  decodeToken(token: string) {
    return this._jwtService.decode(token);
  }

  generateAccessAndRefreshToken(user: IHUser) {
    const { accessSignatureKey, refreshSignatureKey } =
      this.getSignatureKeyByRole(user.role);

    const tokenID = randomUUID(); // Generate a unique identifier for the token (jti)

    const access_token = this.generateToken({
      signatureKey: accessSignatureKey,
      options: {
        audience: [String(user.role), TokenTypeEnum.ACCESS],
        expiresIn: '30m', // 30 minutes
        subject: user._id.toString(),
        jwtid: tokenID,
      },
    });

    const refresh_token = this.generateToken({
      signatureKey: refreshSignatureKey,
      options: {
        audience: [String(user.role), TokenTypeEnum.REFRESH],
        expiresIn: '1y',
        subject: user._id.toString(),
        jwtid: tokenID,
      },
    });

    return { access_token, refresh_token };
  }

  async checkToken(token: string, tokenTypeParm = TokenTypeEnum.ACCESS) {
    const decodedToken = this.decodeToken(token) as JwtPayload;

    if (!decodedToken || !decodedToken.aud) {
      throw new UnauthorizedException('Invalid token');
    }
    const [role, tokenType] = decodedToken.aud;

    if (tokenType != tokenTypeParm) {
      throw new BadRequestException('Invalid token type');
    }
    const { refreshSignatureKey, accessSignatureKey } =
      this.getSignatureKeyByRole(Number(role) as RoleEnum);

    const signatureKey =
      tokenType === TokenTypeEnum.ACCESS
        ? accessSignatureKey
        : refreshSignatureKey;
    const verifiedToken = this.verifyToken({
      token,
      signatureKey,
    }) as JwtPayload;

    //   if (
    //   await this._redisService.exists(
    //     this._redisService.getBlacklistTokenKey({
    //       userId: verifiedToken.sub as string,
    //       tokenId: verifiedToken.jti,
    //     }),
    //   )
    // ) {
    //   throw new UnauthorizedException('You need to login again');
    // }

    const user = await this._userRepo.findById({
      _id: verifiedToken.sub as string,
    });

    if (!user) {
      throw new UnauthorizedException('account not found , signup again');
    }

    if (new Date(verifiedToken.iat! * 1000) < user.changeCreditTime) {
      throw new UnauthorizedException('You need to login again');
    }

    return {
      user,
      verifiedToken,
    };
  }
}
