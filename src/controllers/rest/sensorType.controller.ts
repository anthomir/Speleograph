import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  QueryParams,
} from "@tsed/platform-params";
import { Get, Post,  Delete } from "@tsed/schema";
import { Authenticate} from "@tsed/passport";
import { Req, Res } from "@tsed/common";
import { SensorTypeService } from "../../services/sensorType/sensorType.service";

@Controller("/sensorType")
export class SensorTypeController {
  
  @Inject(SensorTypeService)
  private sensorTypeService: SensorTypeService;

  @Get("/")
  @Authenticate("jwt")
  async get( @Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string) {
    return await this.sensorTypeService.find(req, res, filter);
  }

  @Post("/")
  @Authenticate("jwt")
  async post( @Req() req: Req, @Res() res: Res, @BodyParams() body?: any) {
    return res.status(200).json({success: true, data: await this.sensorTypeService.post(req, res, body)})
  }

  @Delete("/")
  @Authenticate("jwt")
  async delete(@Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string) {
    return res.status(200).json({success: true, data: await this.sensorTypeService.delete(req, res, filter)})
  }
}
