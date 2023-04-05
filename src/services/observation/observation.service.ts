import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { $log } from "@tsed/logger";
import { User } from "../../models/User";
import jwt from "jsonwebtoken";
import { comparePassword, cryptPassword } from "src/utils/compare_password";
import { Observation } from "src/models/Observation";

@Service()
export class ObservationService {
  @Inject(Observation)
  private Observation: MongooseModel<Observation>;

  async find(filter?: any): Promise<Observation[] | null> {
    let data = filter ? await this.Observation.find(JSON.parse(filter)).select("-_id-index-serialNo") : await this.Observation.find().select("-_id-index-serialNo");
    return data;
  }

  async delete(filter: any){
    return await this.Observation.deleteMany(filter) 
  }

}
