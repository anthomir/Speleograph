import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import axios from "axios";
import fs from "fs"

@Service()
export class CaveService {


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

  async searchByNameAutoFill(@Req() req : Req, @Res() res: Res, name?: string, country?: string) {
    try{
      let response = await axios({
        method: 'POST',
        url: `${process.env.GROTTOCAVE_API}/advanced-search`,
        params: {
          complete: true,
          resourceType: "entrances",
          name: name ? name : undefined,
          country: country ? country : undefined,
        }
      });

      if(!response.data){
        return res.status(404).json({success: false, err: "No data found"})
      }

      return res.status(200).json({success: true, data: response.data})
    } catch(err){
      return res.status(500).json({success: true, err: err})
    }
  }

}
