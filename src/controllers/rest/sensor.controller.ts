import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  HeaderParams,
  PathParams,
  QueryParams,
} from "@tsed/platform-params";
import { Get, Post, Put, Delete, Security, Header, Returns } from "@tsed/schema";
import { Authenticate, Authorize } from "@tsed/passport";
import { Req, Res } from "@tsed/common";
import { ObservationService } from "src/services/observation/observation.service";
import { Sensor } from "src/models/Sensor";
import { SensorService } from "src/services/sensor/sensor.service";

@Controller("/sensor")
export class SensorController {
  @Inject(SensorService)
  private sensorService: SensorService;

  @Get("/")
  async get( @Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string) {
    return await this.sensorService.find(req, res);
  }

  @Post("/")
  async post( @Req() req: Req, @Res() res: Res, @BodyParams() body?: Sensor) {
    return res.status(200).json({success: true, data: await this.sensorService.post(req, res, body)})
  }

  @Delete("/")
  @Authenticate("jwt")
  async delete(@Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string) {
    return res.status(200).json({success: true, data: await this.sensorService.delete(req, res, filter)})
  }
}
