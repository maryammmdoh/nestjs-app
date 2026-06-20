import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { IsMatchdata } from 'src/common/validation/match.validation';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;

  @IsOptional()
  @IsString()
  FCM!: string;
}

export class SignupDto extends LoginDto {
  @MaxLength(20)
  @MinLength(3)
  @IsString()
  userName!: string;

  @ValidateIf((obj) => {
    return obj.password;
  })
  @IsMatchdata(['password'])
  confirmPassword!: string;

  @IsOptional()
  @IsEnum(['Male', 'Female'], { message: 'gender must Male or Female' })
  gender!: string;

  @IsOptional()
  @IsPhoneNumber()
  phone!: string;
}

// export class ConfirmEmailDto {
//   @IsEmail()
//   email!: string;

//   @Matches(/\d{6}/)
//   OTP!: string;
// }

export class ResendConfirmEmailDto {
  @IsEmail()
  email!: string;
}

export class ConfirmEmailDto extends ResendConfirmEmailDto {
  @Matches(/\d{6}/)
  OTP!: string;
}

export class SignupWithGmailDto {
  @IsString()
  idToken!: string;
}
