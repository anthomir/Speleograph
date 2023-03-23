import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  HeaderParams,
  PathParams,
  QueryParams,
  UsePipe,
  UseValidation,
} from "@tsed/platform-params";
import { Get, Post, Put, Delete, Security, Header, Returns } from "@tsed/schema";
import { User } from "src/models/User";
import { UserService } from "../../services/user/user.service";
import { Authenticate, Authorize } from "@tsed/passport";
import { Req, Res } from "@tsed/common";
import {UserSchema} from "../../schemas/UserSchema"
import { UseJoiValidation } from "../../validation/validation.decorator";

@Controller("/user")
export class UserController {
  @Inject(UserService)
  private usersService: UserService;

  @Post("/register")
  post(@Req() req: Req, @Res() res: Res,  @BodyParams() @UseJoiValidation(UserSchema) body: User) {
      return this.usersService.create(body, res);
  }

  @Post("/login")
  login(@Req() req: Req, @Res() res: Res, @BodyParams() body: any) {
    return this.usersService.login(body, res);
  }

  @Get("/")
  @Authenticate("jwt")
  get( @Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string) {
    return res.status(200).json({success: true, data: filter ? this.usersService.find(filter) : this.usersService.find()})
  }

  @Get("/profile")
  @Authenticate("jwt")
  getProfile( @Req() req: Req, @Res() res: Res) {
    return res.status(200).json({success: true, data: req.user})
  }

  @Put("/")
  @Authenticate("jwt")
  put(@Req() req: Req, @Res() res: Res, @BodyParams() body: any, @PathParams("id") id: string) {
    this.usersService.update(req, res, body);
    return res.status(200).json({success: true})
  }

  @Delete("/")
  @Authenticate("jwt")
  delete(@Req() req: Req, @Res() res: Res) {
    return this.usersService.delete(req, res);
  }
}
