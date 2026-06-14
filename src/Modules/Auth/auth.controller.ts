import {
  Body,
  HttpCode,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import {
  Get,
  Post,
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import { SignupDto } from './dto/signup-dto';
import { AuthService } from './auth.service';
import { Model } from 'mongoose';
import { User } from 'src/model/User.model';

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

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(
    @Body() date: SignupDto,
    // @Query() query: SignupQueryDto,
  ) {
    return this._authService.signup(date);
    
  }
}
