import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  PathParams,
  QueryParams,
} from "@tsed/platform-params";
import {  Post } from "@tsed/schema";
import { Authenticate, Authorize } from "@tsed/passport";
import { MulterOptions, MultipartFile, PlatformMulterFile, Req, Res } from "@tsed/common";
import { CaveService } from "../../services/cave/cave.service";
import { CaveMetadata } from "../../models/CaveMetadata";
import fs from "fs"
import path from "path";

@Controller("/cave")
export class UserController {
  @Inject(CaveService)
  private caveService: CaveService;

  @Post("/")
  post(@Req() req: Req, @Res() res: Res, @BodyParams() body: CaveMetadata) {
      return this.caveService.create(req, res, body);
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
    if(!file)
        res.status(400).json({success: false, err: "File should be of type .CSV"})
    const filename = file.filename;
    const mimetype = file.mimetype.substring(file.mimetype.indexOf("/")+1);

    fs.rename(`./public/uploads/${filename}`, `./public/uploads/${filename}.${mimetype}`, function(err) {
        if ( err ) 
            return res.status(500).json({success: false, err: ""})
    });

    return res.status(200).json({success: false, data: {filename: `${filename}.${mimetype}`}})
  }
}

