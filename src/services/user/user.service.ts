import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { $log } from "@tsed/logger";
import { User } from "../../models/User";
import jwt from "jsonwebtoken";
import { comparePassword, cryptPassword } from "src/utils/compare_password";

@Service()
export class UserService {
  @Inject(User)
  private User: MongooseModel<User>;

  async find(filter?: any): Promise<User[] | null> {
    return filter ? await this.User.find(filter) : this.User.find();
  }

  async findById(id: string): Promise<User | null> {
    return await this.User.findById(id);
  }

  async create(user: User): Promise<User> {
    try{
      let passwordEncrypted = await cryptPassword(user.password);
      let userToCreate = { ...user, password: passwordEncrypted };

      const model = new this.User(userToCreate);

      await model.updateOne(userToCreate, { upsert: true });

      return model;
    } catch(err){
      return err.message
    }
  }

  async login(body: any, res: Res) {
    if (!body.email || !body.password) {
      return res.status(400).json({ success: false, msg: "Bad Request" });
    }

    let user = await this.User.findOne({ email: body.email }).select("+password").lean();
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    let valid;
    try {
      valid = await comparePassword(body.password, user.password);
    } catch (err) {
      valid = false;
      return res
        .status(400)
        .json({ success: false, msg: "An unexpected error occured" });
    }

    if (!valid) {
      return res
        .status(401)
        .json({ success: false, msg: "Incorrect credentials" });
    }

    const token = jwt.sign(
      { sub: user._id.toString() },
      String(process.env.SECRET),
      {
        expiresIn: "1d",
      }
    );

    let userToReturn = { ...user, token: token };
    return res.status(200).json({ success: true, data: userToReturn });
  }

  async update(req: Req, body: any, res: Res){
    await this.User.updateOne({id: req.query.id},{ role: body.role})
    return true;
  }

  async delete(req: Req, res: Res): Promise<User | any> {
    if (!req.user) {
      return res.status(404).json({ success: false, msg: "Not Found" });
    }
    return await this.User.deleteOne(req.user);
  }
}
