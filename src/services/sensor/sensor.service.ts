import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import jwt from "jsonwebtoken";
import { Sensor } from "../../models/Sensor";

@Service()
export class SensorService {

  @Inject(Sensor)
  private Sensor: MongooseModel<Sensor>;

    // JWT
    async find(req : Req, res: Res, skip: string, take: string) {
        try{
            return res.status(200).json({success: true, data: await this.Sensor.find({createdBy: req.user}).skip( skip ? parseInt(skip) : 0).limit(take ? parseInt(take) : 100) })
        } catch (err){
            return res.status(500).json({success: false, err: err })
        }
    }

    // JWT
    async post(req : Req, res: Res, body: any){
        try{
            return res.status(201).json({success: true, data: await this.Sensor.create({name: body.name, sensorType: body.sensorType.id, createdBy: req.user}) })
        } catch (err){
            return res.status(500).json({success: false, err: err })
        }
    }

    // JWT
    async delete(req : Req, res: Res, id: string){
        try{
            let user: any | undefined = req.user
            let sensor = await this.Sensor.findById(id);
            if(!sensor){
                return res.status(404).json({success: false, err: "Sensor not found" })
            }

            if(sensor.createdBy != user.id){
                return res.status(401).json({success: false, err: "Unauthorized Deletion of unowned sensors" })
            }

            await this.Sensor.deleteOne({id: id})
            return res.status(200).json({ success: true })
        } catch (err){
            return res.status(500).json({success: false, err: err })
        }
    }

    // JWT
    async update(req : Req, res: Res, id: string, body: string){
        try{
            let user: any | undefined = req.user
            let sensor = await this.Sensor.findById(id);
            if(!sensor){
                return res.status(404).json({success: false, err: "Sensor not found" })
            }

            if(sensor.createdBy != user.id){
                return res.status(401).json({success: false, err: "Unauthorized Change of unowned sensors" })
            }

            await this.Sensor.updateOne({id: id}, {body});
            let sensorToSendBack = await this.Sensor.findById(id);
            
            return res.status(200).json({ success: true, data: sensorToSendBack })
        } catch (err){
            return res.status(500).json({success: false, err: err })
        }
    }

}
