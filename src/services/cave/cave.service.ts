import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import axios from "axios";
import { CaveMetadata } from "src/models/CaveMetadata";

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
}
