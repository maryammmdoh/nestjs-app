import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from '../common/Enum/user.enums';

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

UserSchema.pre('save', async function (this: IHUser & { wasNew: boolean }) {
  //   if (this.isModified("password")) {
  //     const hashedPassword = await hashOperation({
  //       plainValue: this.password,
  //       rounds: SALT_ROUNDS,
  //     });
  //     this.password = hashedPassword;
  //   }
  //   if (this.phone && this.isModified("phone")) {
  //     const phoneEncrypted = encryptvalue({ value: this.phone });
  //     this.phone = phoneEncrypted;
  //   }
  //   console.log("Pre-save hook executed for user:", this);
});

UserSchema.post('save', async function (this: IHUser & { wasNew: boolean }) {
  //   try {
  //     if (this.wasNew) {
  //       await MailService.SendEmailOTP({
  //         email: this.email,
  //         emailType: EmailEnum.CONFIRM_EMAIL,
  //         subject: "Please confirm your email",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error sending email OTP:", error);
  //   }
  //   console.log("Post-save hook executed for user:", this);
});

UserSchema.pre(['findOne', 'find'], function () {
  console.log('Pre-findOne hook executed with filter:', this.getFilter());
  const query = this.getQuery();

  // if (query.paranoid == true) {
  //     this.setQuery({ ...query, deletedAt: { $exists: false } });
  // } else {
  //     this.setQuery({ ...query });
  // }

  // Another way to check for the presence of the paranoid filter in the query is to directly check if the paranoid property exists in the query object. If it does, we can assume that the caller intends to apply soft deletion filtering, and we can modify the query accordingly. If it doesn't exist, we can proceed with the original query without adding any additional filters. Here's how you can implement this logic:
  if (!query.getSoftDelete) {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});

const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);

// const UserModel = MongooseModule.forFeature([{ name: User.name, useFactory: () => UserSchema }]);

export default UserModel;
