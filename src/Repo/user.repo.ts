import { Model, ObjectId } from "mongoose";
import DBRepo from "./db.repo.js";
import { InjectModel } from "@nestjs/mongoose";
import { IUser, User } from "../model/User.model.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepo extends DBRepo<IUser> {
    constructor(@InjectModel(User.name) private _userModel: Model<User>) {
        super(_userModel);
    }

    async checkUserExists(id: ObjectId): Promise<boolean> {
    return (await this.findone({ filter: { _id: id } })) != null;
  }
}