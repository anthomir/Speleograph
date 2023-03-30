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

@Controller("/observation")
export class UserController {
  @Inject(ObservationService)
  private observationService: ObservationService;

  @Get("/")
  @Authenticate("jwt")
  async get( @Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string) {
    return res.status(200).json({success: true, data: filter ? await this.observationService.find(filter) : await this.observationService.find()})
  }

  @Get("/profile")
  @Authenticate("jwt")
  async getProfile( @Req() req: Req, @Res() res: Res) {
    return res.status(200).json({success: true, data: req.user})
  }


  @Delete("/")
  @Authenticate("jwt")
  async delete(@Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string) {
    return res.status(200).json({success: true, data: await this.observationService.delete(filter)})
  }
}
