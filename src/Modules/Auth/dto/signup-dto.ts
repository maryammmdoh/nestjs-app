import {
  IsBoolean,
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { Transform } from 'class-transformer';
import { IsMatchdata } from '../../../common/validation/match.validation';

export class SignupDto {
  @MaxLength(20)
  @MinLength(3)
  @IsString({ message: 'Username must be a string' })
  userName!: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsMatchdata(['email'], { message: 'Confirm email must match email' })
  confirmEmail!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 2,
    minNumbers: 0,
    minSymbols: 2,
  })
  password!: string;

  @ValidateIf((obj) => {
    return obj['password'];
  })
  @IsMatchdata(['password'], {
    message: 'Confirm password must match password',
  })
  confirmPassword!: string;

  @Transform((obj) => {
    if (
      obj.value == 'true' ||
      obj.value == true ||
      obj.value == 1 ||
      obj.value == '1'
    ) {
      return true;
    }
    if (
      obj.value == 'false' ||
      obj.value == false ||
      obj.value == 0 ||
      obj.value == '0'
    ) {
      return false;
    }
    return obj.value;
  })
  @IsBoolean()
  flag!: boolean;
}
