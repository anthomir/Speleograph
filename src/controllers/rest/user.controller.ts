import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, HeaderParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Put, Delete, Security, Header, Returns } from '@tsed/schema';
import { User } from '../../models/User';
import { UserService } from '../../services/user/user.service';
import { Authenticate, Authorize } from '@tsed/passport';
import { Req, Res } from '@tsed/common';
import { UserCreationSchema, UserLoginSchema } from '../../schemas/UserSchema';

//TODO: Refactor
@Controller('/user')
export class UserController {
    @Inject(UserService)
    private usersService: UserService;

    @Post('/register')
    async post(@Res() res: Res, @BodyParams() body: any) {
        let response = await this.usersService.findOne({
            $or: [{ email: body.email }, { license: body.license }],
        });
        if (response) {
            return res.status(409).json({ success: false, err: 'Email/License already exists' });
        }
        return await this.usersService.create(body, res);
    }

    @Post('/login')
    async login(@Req() req: Req, @Res() res: Res, @BodyParams() body: any) {
        return await this.usersService.login(body, res);
    }

    @Get('/')
    @Authenticate('jwt')
    async get(
        @Req() req: Req,
        @Res() res: Res,
        @QueryParams('filter') filter?: string,
        @QueryParams('take') take?: string,
        @QueryParams('skip') skip?: string,
        @QueryParams('sortBy') sortBy?: string,
    ) {
        return await this.usersService.find(filter, take, skip, sortBy);
    }

    @Get('/profile')
    @Authenticate('jwt')
    async getProfile(@Context('user') user: User, @Res() res: Res) {
        if (user) {
            const userToReturn = await this.usersService.findProfile(user);

            return res.status(200).json({ success: true, data: userToReturn });
        } else {
            return res.status(500).json({ success: false, err: 'Internal server error' });
        }
    }

    @Put('/')
    @Authenticate('jwt')
    async put(@Context('user') user: User, @Res() res: Res, @BodyParams() body: any) {
        return await this.usersService.update(user, res, body);
    }

    @Delete('/')
    @Authenticate('jwt')
    async delete(@Context('user') user: User, @Res() res: Res) {
        return await this.usersService.delete(user, res);
    }
    @Post('/forgot-password')
    async forgotPassword(@Req() req: Req, @Res() res: Res, @BodyParams() body: any) {
        return await this.usersService.forgetPasswordSendMail(req, res, body);
    }

    @Post('/reset-password')
    async resetPassword(@Req() req: Req, @Res() res: Res, @BodyParams() body: any) {
        return await this.usersService.resetPassword(req, res, body);
    }
}
