import type { Request } from 'express';
import { IHUser } from 'src/model/User.model';
import { JwtPayload } from 'jsonwebtoken';

export interface IRequestAuth extends Request {
  user: IHUser;
  verifiedToken?: JwtPayload;
}