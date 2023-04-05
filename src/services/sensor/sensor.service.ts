import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { $log } from "@tsed/logger";
import { User } from "../../models/User";
import jwt from "jsonwebtoken";
import { Sensor } from "src/models/Sensor";
import { SensorType } from "src/models/Enum";
import { OnInstall } from "@tsed/passport";

@Service()
export class SensorService implements OnInit {

  @Inject(Sensor)
  private Sensor: MongooseModel<Sensor>;

  //JWT
  async find(req : Req, res: Res) {
    try{
        return res.status(200).json({success: true, data: await this.Sensor.find() })
    } catch (err){
        return res.status(500).json({success: false, err: err })
    }
  }

  //Anyone
  async post(req : Req, res: Res, body: any){
    try{
        return res.status(201).json({success: true, data: await this.Sensor.create(body) })
    } catch (err){
        return res.status(500).json({success: false, err: err })
    }
  }

  // Only Admin
  async delete(req : Req, res: Res, filter: any){
    try{
        return res.status(200).json({success: true, data: await this.Sensor.deleteMany(filter)  })
    } catch (err){
        return res.status(200).json({success: false, err: err })
    }
  }

  //Initialise the Sensor Data
  async $onInit() {
    try{
        const sensorCount = (await this.Sensor.find()).length;

        if(sensorCount > 0){
            return;
        }
        let reefArray: Array<string> = new Array("Encoding", "SensorId", "Timestamp", "AAAA", "MM", "JJ", "HH", "mm" , "ss", "Pressure(hPa)", "Temperature(Kelvin) 1", "Temperature(Kelvin) 2");
        let ctdArray: Array<string> = new Array("Date-Time", "Pressure(cmH20)", "Temperature(C)", "Conductivity");
        let pluvioArray : Array<string> = new Array("Date-Time", "RainMeter");

        await this.Sensor.create({name: SensorType.ReefNet, properties: reefArray})
        await this.Sensor.create({name: SensorType.CTDSensor, properties: ctdArray})
        await this.Sensor.create({name: SensorType.PluvioMeter, properties: pluvioArray})

        console.log("Default Sensor Creation Successful");
        return;
    }
    catch (err) {
        console.log("Error while initializing the Default sensors: "+err)
    }
  }


}
