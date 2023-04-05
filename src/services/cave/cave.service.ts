import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import axios from "axios";
import { CaveMetadata } from "src/models/CaveMetadata";
import fs from "fs"
import csv from 'csv-parser'
import { Observation } from "src/models/Observation";

@Service()
export class CaveService {
  @Inject(Observation)
  private Observation: MongooseModel<Observation>;

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
        method: 'get',
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

  async create(req: Req, res: Res, caveMetadata: CaveMetadata) {
    try{


    } catch(err){

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

    let results : any= []
    fs.createReadStream(`./public/uploads/${filename}.${mimetype}`).pipe(csv(['index', 'serialNo', 'number', 'year', 'month', 'day', 'minute', 'second', 'i', 'j', 'k', 'l', 'm']))
      .on("data", (data)=>{
        results.push(data);
      })
      .on("end", async () => {
        await this.Observation.insertMany(results)
        
        // for(const result of results){
        //   console.log(`hello`)
        // }
      })
    return res.status(200).json({success: false, data: {filename: `${filename}.${mimetype}`}})
  }
}
