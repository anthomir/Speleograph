import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import axios from "axios";
import { CaveObservation } from "../../models/CaveObservation";
import fs from "fs"

@Service()
export class CaveObservationService {
  @Inject(CaveObservation)
  private CaveObservation: MongooseModel<CaveObservation>;

  async find(req: Req, res: Res, filter?: any) {
    try{
      return res.status(200).json({success: true,  data: filter ? await this.CaveObservation.find(JSON.parse(filter)) : await this.CaveObservation.find({})})
    } catch(err){
      return res.status(500).json({success: false, err: err})
    }
  }

  async create(req: Req, res: Res, caveMetadata: any) {
    try{
      let user : any = req.user
      if(!user){
        return res.status(500).json({success: true, err: "unauthorized"})
      }
      caveMetadata.userId = user._id;

      let cave = await this.CaveObservation.create(caveMetadata);
      return res.status(200).json({success: true, data: cave})
    } catch(err){
      return res.status(500).json({success: true, err: err})
    }
  }

  async postFile(req: Req, res: Res, file: any){
    if(!file)
      return res.status(400).json({success: false, err: "File should be of type .CSV"})

    const filename = file.filename;
    const mimetype = file.mimetype.substring(file.mimetype.indexOf("/")+1);

    fs.rename(`./public/uploads/${filename}`, `./public/uploads/${filename}.${mimetype}`, function(err) {
        if ( err ) 
            return res.status(500).json({success: false, err: ""})
    });
    return res.status(200).json({success: false, data: {fileUrl: `${process.env.DEVELOPMENT_URL}/${filename}.${mimetype}`}})
  }
}
