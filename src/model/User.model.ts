import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from '../common/Enum/user.enums';
import { SecurityService } from '../common/module/security/security.service';
import { SecurityModule } from '../common/module/security/security.module';
import { EmailEnum } from 'src/common/Enum/email.enums';
import { EmailService } from './../common/service/email.service';

export interface IUser {
  userName: string;
  email: string;
  password: string;
  provider: ProviderEnum;
  confirmEmail: boolean;
  profilePic: string;
  coverPic: string[];
  age: number;
  phone: string;
  gender: GenderEnum;
  role: RoleEnum;
  changeCreditTime: Date;
  deletedAt: Date;
}

export type IHUser = HydratedDocument<IUser>;

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class User {
  @Prop({ type: String, required: true })
  userName!: string;

  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: Boolean, default: false })
  confirmEmail!: boolean;

  @Prop({
    type: String,
    required: function (this: any): boolean {
      return this.provider == ProviderEnum.System;
    },
  })
  password!: string;

  @Prop({ type: String })
  profilePic!: string;

  @Prop({ type: [String] })
  coverPic!: string[];

  @Prop({ type: Number })
  age!: number;

  @Prop({ type: String })
  phone!: string;

  @Prop({ type: Number, enum: GenderEnum, default: GenderEnum.Male })
  gender!: GenderEnum;

  @Prop({ type: Number, enum: ProviderEnum, default: ProviderEnum.System })
  provider!: ProviderEnum;

  @Prop({ type: Number, enum: RoleEnum, default: RoleEnum.User })
  role!: RoleEnum;

  @Prop({ type: Date })
  changeCreditTime!: Date;

  @Prop({ type: Date })
  deletedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// const UserModel = MongooseModule.forFeature([
//   { name: User.name, schema: UserSchema },
// ];

const UserModel = MongooseModule.forFeatureAsync([
  {
    name: User.name,
    useFactory: (securityService: SecurityService) => {
      UserSchema.pre(
        'save',
        async function (this: IHUser & { wasNew: boolean }) {
          if (this.isModified('password')) {
            const hashedPassword = await securityService.hashOperation({
              plainValue: this.password,
              // rounds: securityService.SALT_ROUNDS,
            });
            this.password = hashedPassword;
          }
          if (this.phone && this.isModified('phone')) {
            const phoneEncrypted = securityService.encryptvalue({
              value: this.phone,
            });
            this.phone = phoneEncrypted;
          }
          console.log('Pre-save hook executed for user:', this);
        },
      );

      // UserSchema.post(
      //   'save',
      //   async function (this: IHUser & { wasNew: boolean }) {
      //     try {
      //       if (this.wasNew) {
      //         await emailService.sendEmailOTP({
      //           email: this.email,
      //           emailType: EmailEnum.CONFIRM_EMAIL,
      //           subject: 'Confirm your email',
      //         });
      //       }
      //     } catch (error) {
      //       console.error('Error sending email OTP:', error);
      //     }
      //     console.log('Post-save hook executed for user:', this);
      //   },
      // );

      UserSchema.pre(['findOne', 'find'], function () {
        console.log('Pre-findOne hook executed with filter:', this.getFilter());
        const query = this.getQuery();

        if (!query.getSoftDelete) {
          this.setQuery({ ...query, deletedAt: { $exists: false } });
        }
      });
      return UserSchema;
    },
    imports: [SecurityModule],
    inject: [SecurityService],
  },
]);

export default UserModel;
