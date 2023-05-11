import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  HeaderParams,
  PathParams,
  QueryParams,
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
  async post(@Req() req: Req, @Res() res: Res, @BodyParams() @UseJoiValidation(UserSchema) body: User) {
      return await this.usersService.create(body, res);
  }

  @Post("/login")
  async login(@Req() req: Req, @Res() res: Res, @BodyParams() body: any) {
    return await this.usersService.login(body, res);
  }

  @Get("/")
  @Authenticate("jwt")
  async get( @Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string, @QueryParams("take") take?: string, @QueryParams("skip") skip?: string, @QueryParams("sortBy") sortBy?: string) {
    return res.status(200).json({success: true, data: filter ? await this.usersService.find(filter, take,skip,sortBy) : await this.usersService.find({}, take, skip, sortBy)})
  }

  @Get("/profile")
  @Authenticate("jwt")
  async getProfile( @Req() req: Req, @Res() res: Res) {
    return res.status(200).json({success: true, data: req.user})
  }

  @Put("/")
  @Authenticate("jwt")
  async put(@Req() req: Req, @Res() res: Res, @BodyParams() body: any, @PathParams("id") id: string) {
    return await this.usersService.update(req, res, body);
  }

  @Delete("/")
  @Authenticate("jwt")
  async delete(@Req() req: Req, @Res() res: Res) {
    return await this.usersService.delete(req, res);
  }
}
