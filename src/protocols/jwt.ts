import { Context, Inject, Req, Res } from '@tsed/common';
import { Unauthorized } from '@tsed/exceptions';
import { Arg, OnInstall, OnVerify, Protocol } from '@tsed/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../services/user/user.service';
import { User } from '../models/User';

@Protocol({
    name: 'jwt',
    useStrategy: Strategy,
    settings: {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: String(process.env.SECRET),
    },
})
export class JwtProtocol implements OnVerify, OnInstall {
    @Inject()
    usersService: UserService;

    async $onVerify(@Req() req: Req, @Arg(0) jwtPayload: any, @Res() res: Res, @Context() ctx: Context) {
        let userFound: User | null = await this.usersService.findById(jwtPayload.sub);

        if (!userFound) {
            return res.status(401).json({ success: false, err: 'unauthorized' });
        }

        req.user = userFound;
        return req.user;
    }

    $onInstall(strategy: Strategy): void {}
}
