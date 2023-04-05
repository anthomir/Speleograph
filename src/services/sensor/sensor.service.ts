import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { $log } from "@tsed/logger";
import { User } from "../../models/User";
import jwt from "jsonwebtoken";
import { comparePassword, cryptPassword } from "src/utils/compare_password";
import { Observation } from "src/models/Observation";
import { Sensor } from "src/models/Sensor";

@Service()
export class SensorService {
  @Inject(Sensor)
  private Sensor: MongooseModel<Sensor>;

  async find(req : Req, res: Res) {
    try{
        return res.status(200).json({success: true, data: await this.Sensor.find() })
    } catch (err){
        return res.status(500).json({success: false, err: err })
    }
  }

  async post(req : Req, res: Res, body: any){
    try{
        return res.status(201).json({success: true, data: await this.Sensor.create(body) })
    } catch (err){
        return res.status(500).json({success: false, err: err })
    }
  }

  // Only Admin
  async delete(req : Req, res: Res,filter: any){
    try{
        return res.status(200).json({success: true, data: await this.Sensor.deleteMany(filter)  })
    } catch (err){
        return res.status(200).json({success: false, err: err })
    }
  }

}
