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
import { CaveMetadata } from "../../models/CaveMetadata";
import path from "path";

@Controller("/cave")
export class CaveController {
  @Inject(CaveService)
  private caveService: CaveService;

  @Post("/")
  post(@Req() req: Req, @Res() res: Res, @BodyParams() body: CaveMetadata) {
      return this.caveService.create(req, res, body);
  }

  @Get("/:id")
  getById(@Req() req: Req, @Res() res: Res, @PathParams("id") id: string) {
      return this.caveService.findById(req, res, id);
  }

  @Get("/search")
  search(@Req() req: Req, @Res() res: Res, @BodyParams() body: any) {
      return this.caveService.findById(req, res, body);
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
  uploadFile(@MultipartFile("file") file: PlatformMulterFile, @Req() req: Req, @Res() res : Res ) {
    return this.caveService.postFile(req,res, file);
  }
}

