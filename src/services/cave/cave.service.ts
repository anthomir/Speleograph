import { Inject, Req, Res, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
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

  async findById(id: string) {
    try{


    } catch(err){

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
