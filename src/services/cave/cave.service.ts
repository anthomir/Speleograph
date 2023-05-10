import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import axios from "axios";
import { CaveMetadata } from "src/models/CaveMetadata";
import fs from "fs"

@Service()
export class CaveService {
  @Inject(CaveMetadata)
  private CaveMetadata: MongooseModel<CaveMetadata>;

  async find(filter?: any) {
    try{


    } catch(err){

    }
  }

  async findById(@Req() req : Req, @Res() res: Res, id: string) {
    try{
      let response = await axios({
        method: 'GET',
        url: `${process.env.GROTTOCAVE_API}/caves/${id}`,
      });

      if(!response.data){
        return res.status(404).json({success: false, err: "No data found"})
      }

      return res.status(200).json({success: true, data: response.data})
    } catch(err){
      return res.status(500).json({success: true, err: err})
    }
  }

  async searchByNameAutoFill(@Req() req : Req, @Res() res: Res) {
    try{

      return res.status(200).json({success: true, data: "arrayNames"})
    } catch(err){
      return res.status(500).json({success: true, err: err})
    }
  }

  async create(req: Req, res: Res, caveMetadata: CaveMetadata) {
    try{
      let cave = await this.CaveMetadata.create(caveMetadata);
      return res.status(200).json({success: true, data: cave})
    } catch(err){
      return res.status(500).json({success: true, err: err})
    }
  }

  async update(req: Req, body: any, res: Res) {
    try{


    } catch(err){

    }
  }

  async delete(req: Req, res: Res){
    try{


    } catch(err){

    }
  }

  async postFile(req: Req, res: Res, file: any){
    if(!file)
      res.status(400).json({success: false, err: "File should be of type .CSV"})

    const filename = file.filename;
    const mimetype = file.mimetype.substring(file.mimetype.indexOf("/")+1);

    fs.rename(`./public/uploads/${filename}`, `./public/uploads/${filename}.${mimetype}`, function(err) {
        if ( err ) 
            return res.status(500).json({success: false, err: ""})
    });
    return res.status(200).json({success: false, data: {fileUrl: `${process.env.DEVELOPMENT_URL}/${filename}.${mimetype}`}})
  }
}
