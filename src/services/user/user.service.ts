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
    return await this.User.findById(id).lean();
  }

  async create(user: User, res: Res) {
    try{
      const passwordEncrypted = await cryptPassword(user.password);
      const userToCreate = { ...user, password: passwordEncrypted };

      const userByEmail = await this.User.findOne({email: userToCreate.email})

      if(userByEmail)
        return res.status(409).json({success: false, err: "Account with this email already exists"})
        
      return await this.User.create(userToCreate);
    } catch(err){
      return res.status(500).json({success: false, err: "Internal Server Error"})
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

  async update(req: Req, res: Res, body: any){

    if(!req.user)
      return res.status(404).json({success:false, err: "Unable to find user to update"})

    await this.User.updateOne(req.user, { name: body.name })
    return true;
  }

  async delete(req: Req, res: Res): Promise<User | any> {
    if (!req.user) {
      return res.status(404).json({ success: false, msg: "Not Found" });
    }
    return await this.User.deleteOne(req.user);
  }
}
