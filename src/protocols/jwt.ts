import {Inject, Req, Res} from "@tsed/common";
import {Unauthorized} from "@tsed/exceptions";
import {Arg, OnInstall, OnVerify, Protocol} from "@tsed/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import { UserService } from "../services/user/user.service";

@Protocol({
  name: "jwt",
  useStrategy: Strategy,
  settings: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: String(process.env.SECRET)
  }
})
export class JwtProtocol implements OnVerify, OnInstall {
  @Inject()
  usersService: UserService;

  async $onVerify(@Req() req: Req, @Arg(0) jwtPayload: any, @Res() res: Res) {
    const user = await this.usersService.findById(jwtPayload.sub);

    if (!user) {
      return res.status(401).json({success: false, err: "unauthorized"})
    }
    req.user = user;
    return user;
  }

  $onInstall(strategy: Strategy): void {
    console.log("Test")
  }
}

