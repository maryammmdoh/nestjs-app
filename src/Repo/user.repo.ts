import { Model, ObjectId } from "mongoose";
import DBRepo from "./db.repo.js";
import { InjectModel } from "@nestjs/mongoose";
import { IHUser, User } from "../model/User.model.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepo extends DBRepo<User> {
    constructor(@InjectModel(User.name) userModel: Model<User>) {
        super(userModel);
    }

    async checkUserExists(id: ObjectId): Promise<boolean> {
    return (await this.findone({ filter: { _id: id } })) != null;
  }
}