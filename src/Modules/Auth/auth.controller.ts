import {
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import {
  Get,
  Post,
} from '@nestjs/common/decorators/http/request-mapping.decorator';

import { AuthService } from './auth.service';
import { Model } from 'mongoose';
import { User } from 'src/model/User.model';
import { ConfirmEmailDto, LoginDto, ResendConfirmEmailDto, SignupDto, SignupWithGmailDto } from './dto/authentication.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private _authService: AuthService,
    // private _userRepo: Model<User>
  ) {}
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @Get()
  getAuthPage() {
    return this._authService.getAuthPage();
  }

  @Post('signup')
  async signup(
    @Body() body: SignupDto,
    // @Query() query: SignupQueryDto,
  ) {
    const result = await this._authService.signup(body);
    return { message: 'signup successful , OTP sent to your email , Please confirm your email', result };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this._authService.login(body);
    return { message: 'login successful', result };
  }

  @Post('confirm-email')
  async confirmEmail(@Body() body: ConfirmEmailDto) {
    const result = await this._authService.confirmEmail(body);
    return { message: 'email confirmed successfully', result };
  }

  @Post('resend-confirm-email-otp')
  async resendConfirmEmail(@Body() body: ResendConfirmEmailDto) {
    const result = await this._authService.resendConfirmationEmailOTP(body.email);
    return { message: 'OTP resent successfully', result };
  }

  @Post('signup/gmail')
  async signupWithGmail(@Body() body: SignupWithGmailDto,@Res({ passthrough: true }) res: Response) {
    const result = await this._authService.signupWithGmail(body.idToken);
    return { message: 'signup with Gmail successful', result };
  }
}
