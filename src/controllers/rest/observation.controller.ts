import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  PathParams,
  QueryParams,
} from "@tsed/platform-params";
import {  Get, Post } from "@tsed/schema";
import { Authenticate } from "@tsed/passport";
import { MulterOptions, MultipartFile, PlatformMulterFile, Req, Res } from "@tsed/common";
import { CaveObservationService } from "../../services/observation/observation.service";
import path from "path";

@Controller("/cave")
export class CaveObservationController {
  @Inject(CaveObservationService)
  private caveObservationService: CaveObservationService;

  @Authenticate("jwt")
  @Get("/")
  async find(@Req() req: Req, @Res() res: Res, @QueryParams() filter?: any){
    return await this.caveObservationService.find(req, res, filter)
  }


  @Authenticate("jwt")
  @Post("/")
  async post(@Req() req: Req, @Res() res: Res, @BodyParams() body: any) {
      return await this.caveObservationService.create(req, res, body);
  }

  @Post("/upload")
  @MulterOptions({dest: "./public/uploads", fileFilter(req: Req, file, cb ) {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    if (extension !== '.csv' || mimetype !== 'text/csv') {
        cb(null, false)
    }else{
        cb(null, true)
    }
  }})
  async uploadFile(@MultipartFile("file") file: PlatformMulterFile, @Req() req: Req, @Res() res : Res ) {
    return await this.caveObservationService.postFile(req,res, file);
  }
}

