import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { $log } from "@tsed/logger";
import { User } from "../../models/User";
import jwt from "jsonwebtoken";
import { comparePassword, cryptPassword } from "src/utils/compare_password";
import { CaveMetadata } from "src/models/CaveMetadata";
import mongodb from 'mongodb';

@Service()
export class CaveService {
  @Inject(CaveMetadata)
  private CaveMetadata: MongooseModel<CaveMetadata>;

  async find(filter?: any): Promise<CaveMetadata[] | null> {
    return filter ? await this.CaveMetadata.find(filter) : this.CaveMetadata.find();
  }

  async findById(id: string): Promise<CaveMetadata | null> {
    return await this.CaveMetadata.findById(id);
  }

  async create(caveMetadata: CaveMetadata): Promise<CaveMetadata> {
    try{

      const model = new this.CaveMetadata(caveMetadata);

      await model.updateOne(caveMetadata, { upsert: true });

      return model;

    } catch(err){
      return err.message
    }
  }

  async update(req: Req, body: any, res: Res): Promise<any> {
    await this.CaveMetadata.updateOne({id: req.query.id},{ role: body.role})
    return true;
  }

  async delete(req: Req, res: Res): Promise<mongodb.DeleteResult | Res> {
    if (!req.user) {
      return res.status(404).json({ success: false, msg: "Not Found" });
    }
    return await this.CaveMetadata.deleteOne(req.user);
  }
}
