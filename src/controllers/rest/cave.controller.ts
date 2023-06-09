import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  PathParams,
  QueryParams,
} from "@tsed/platform-params";
import {  Get, Post } from "@tsed/schema";
import { Authenticate, Authorize } from "@tsed/passport";
import { MulterOptions, MultipartFile, PlatformMulterFile, Req, Res } from "@tsed/common";
import { CaveService } from "../../services/cave/cave.service";
import path from "path";

@Controller("/cave")
export class CaveController {
  @Inject(CaveService)
  private caveService: CaveService;

  @Authenticate("jwt")
  @Get("/search/:id")
  async getById(@Req() req: Req, @Res() res: Res, @PathParams("id") id: string) {
      return await this.caveService.findById(req, res, id);
  }

  @Authenticate("jwt")
  @Get("/search")
  async search(@Req() req: Req, @Res() res: Res, @QueryParams("name") name?: string, @QueryParams("country") country?: string) {
    return await this.caveService.searchByNameAutoFill(req, res, name, country);
  }

}

