import { Controller, Inject } from "@tsed/di";
import {
  BodyParams,
  HeaderParams,
  PathParams,
  QueryParams,
} from "@tsed/platform-params";
import { Get, Post, Put, Delete, Security, Header } from "@tsed/schema";
import { User } from "src/models/User";
import { UserService } from "../../services/user/user.service";
import { Authenticate, Authorize } from "@tsed/passport";
import { Req, Res } from "@tsed/common";


@Controller("/user")
export class UserController {
  @Inject(UserService)
  private usersService: UserService;

  @Post("/")
  post(@BodyParams() body: User) {
    return this.usersService.create(body);
  }

  @Get("/")
  @Authenticate("jwt")
  get( @Req() req: Req, @Res() res: Res, @QueryParams("filter") filter?: string) {
    return filter ? this.usersService.find(filter) : this.usersService.find();
  }
  
  @Post("/login")
  login(@Req() req: Req, @Res() res: Res, @BodyParams() body: any) {
    return this.usersService.login(body, res);
  }

  @Put("/")
  put(@BodyParams() body: any,@Req() req: Req, @Res() res: Res) {
    return this.usersService.update(req, body, res);
  }

  @Delete("/")
  @Authenticate("jwt")
  delete(@Req() req: Req, @Res() res: Res) {
    return this.usersService.delete(req, res);
  }
}
