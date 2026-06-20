// Auth Service in NestJS
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepo } from '../../Repo/user.repo';
import { SecurityService } from '../../common/module/security/security.service';
import { TokenService } from 'src/Repo/token.service';
import { RedisService } from 'src/common/service/redis.service';
import { EmailEnum } from 'src/common/Enum/email.enums';
import { EmailService } from 'src/common/service/email.service';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from 'src/config/config.service';
import { ProviderEnum } from 'src/common/Enum/user.enums';
import { IHUser } from 'src/model/User.model';
import { ConfirmEmailDto, LoginDto, SignupDto } from './dto/authentication.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private _userRepo: UserRepo,
    private _securityService: SecurityService,
    private _tokenService: TokenService,
    private _redisServices: RedisService,
    private _emailService: EmailService,
    private _configService: ConfigService,
  ) {}
  getAuthPage() {
    return 'auth page';
  }

  async signup(bodydata: SignupDto) {
    const { email } = bodydata;
    const existingUser = await this._userRepo.findone({ filter: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const user = await this._userRepo.create({
      data: bodydata,
    });

    await this._emailService.sendEmailOTP({
      email,
      emailType: EmailEnum.CONFIRM_EMAIL,
      subject: 'Confirm your email',
    });

    return {
      message: 'signup successful',
      data: user,
    };
  }

  public async login(bodyData: LoginDto) {
    const { email, password } = bodyData;
    // Check if email exists
    const existingUser = await this._userRepo.findone({ filter: { email } });
    if (!existingUser) {
      throw new NotFoundException('Invalid email or password');
    }

    if (!existingUser.confirmEmail) {
      throw new BadRequestException(
        'Please confirm your email before logging in',
      );
    }

    // Check if password is correct
    const isPasswordValid = await this._securityService.compareOperation({
      plainValue: password,
      hashvalue: existingUser.password,
    });
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid email or password');
    }

    return this._tokenService.generateAccessAndRefreshToken(existingUser);
  }

  async confirmEmail(bodyData: ConfirmEmailDto) {
    const { email, OTP } = bodyData;

    const user = await this._userRepo.findone({
      filter: { email, confirmEmail: false },
    });
    if (!user) {
      throw new BadRequestException('Invalid email or email already confirmed');
    }

    const storedOTP = await this._redisServices.get({
      key: this._redisServices.getOTPKey({
        email,
        emailType: EmailEnum.CONFIRM_EMAIL,
      }),
    });
    if (!storedOTP) {
      throw new BadRequestException(
        'OTP has expired, please request a new one',
      );
    }
    const isOTPValid = await this._securityService.compareOperation({
      plainValue: OTP,
      hashvalue: storedOTP,
    });

    if (!isOTPValid) {
      throw new BadRequestException('Invalid OTP');
    }
    user.confirmEmail = true;
    await user.save();

    return { message: 'Email confirmed successfully' };
  }

  async resendConfirmationEmailOTP(email: string) {
    await this._emailService.sendEmailOTP({
      email,
      emailType: EmailEnum.CONFIRM_EMAIL,
      subject: 'Resend OTP another time',
    });
    return { message: 'OTP resent successfully' };
  }

  /****************** Login and Signup with Google ******************/

  async verifyGoogleToken(idToken: string) {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return payload;
  }

  async loginWithGoogle(
    idToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payloadGoogleToken = await this.verifyGoogleToken(idToken);
    if (!payloadGoogleToken) {
      throw new BadRequestException('Invalid Google token');
    }

    if (!payloadGoogleToken.email_verified) {
      throw new BadRequestException('Email not verified by Google');
    }

    const user = await this._userRepo.findone({
      filter: {
        email: payloadGoogleToken.email as string,
        provider: ProviderEnum.Google,
      },
    });

    // if (!user) {
    //   return this.signupWithGmail(idToken);
    // }

    const { access_token, refresh_token } =
      this._tokenService.generateAccessAndRefreshToken(user as IHUser);
    return { access_token, refresh_token };
  }

  async signupWithGmail(
    idToken: string,
  ): Promise<{
    status: number;
    result: { access_token: string; refresh_token: string };
  }> {
    const payloadGoogleToken = await this.verifyGoogleToken(idToken);
    if (!payloadGoogleToken) {
      throw new BadRequestException('Invalid Google token');
    }

    if (!payloadGoogleToken.email_verified) {
      throw new BadRequestException('Email not verified by Google');
    }

    const user = await this._userRepo.findone({
      filter: { email: payloadGoogleToken.email as string },
    });

    if (user) {
      if (user.provider == ProviderEnum.System) {
        throw new BadRequestException(
          'Email already exists , sign in with your Email and password',
        );
      }
      return { status: 200, result: await this.loginWithGoogle(idToken) };
    }

    const [newUser] = await this._userRepo.create({
      data: {
        email: payloadGoogleToken.email,
        userName: payloadGoogleToken.name,
        profileImage: payloadGoogleToken.picture,
        provider: ProviderEnum.Google,
        confirmEmail: true,
      },
    });

    return {
      status: 201,
      result: this._tokenService.generateAccessAndRefreshToken(newUser!),
    };
  }
}
