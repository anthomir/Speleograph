import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  QueryParams,
} from "@tsed/platform-params";
import { Get, Post,  Delete, Put } from "@tsed/schema";
import { Authenticate} from "@tsed/passport";
import { Req, Res } from "@tsed/common";
import { SensorService } from "../../services/sensor/sensor.service";

@Controller("/sensor")
export class SensorController {
  
  @Inject(SensorService)
  private sensorService: SensorService;

  @Get("/")
  @Authenticate("jwt")
  async get( @Req() req: Req, @Res() res: Res, @QueryParams("skip") skip: string, @QueryParams("take") take: string ) {
    return await this.sensorService.find(req, res, skip, take);
  }

  @Post("/")
  @Authenticate("jwt")
  async post( @Req() req: Req, @Res() res: Res, @BodyParams() body?: any) {
    return res.status(200).json({success: true, data: await this.sensorService.post(req, res, body)})
  }

  @Put("/:id")
  @Authenticate("jwt")
  async update(@Req() req: Req, @Res() res: Res, @QueryParams("id") id: string, @BodyParams() body?: any) {
    return res.status(200).json({success: true, data: await this.sensorService.update(req, res, id, body)})
  }

  
  @Delete("/:id")
  @Authenticate("jwt")
  async delete(@Req() req: Req, @Res() res: Res, @QueryParams("id") id: string) {
    return res.status(200).json({success: true, data: await this.sensorService.delete(req, res, id)})
  }
}
