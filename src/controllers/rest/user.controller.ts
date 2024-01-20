import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, HeaderParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Put, Delete, Security, Header, Returns } from '@tsed/schema';
import { User } from '../../models/User';
import { UserService } from '../../services/user/user.service';
import { Authenticate, Authorize } from '@tsed/passport';
import { MulterOptions, MultipartFile, PlatformMulterFile, Req, Res } from '@tsed/common';
import { UserCreationSchema, UserLoginSchema } from '../../schemas/UserSchema';
import path from 'path';
import fs from 'fs';
import { RegistrationDto } from '../../validation/registrationDto';
import { validate, Matches } from 'class-validator';

//TODO: Refactor
@Controller('/user')
export class UserController {
    @Inject(UserService)
    private usersService: UserService;

    @Post('/register')
    async post(@Res() res: Res, @BodyParams() body: RegistrationDto) {
        const validationErrors = await validate(body);
        //console.log()
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, err: validationErrors[0]?.constraints?.matches });
        }
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
    @MulterOptions({
        dest: './opt/public/profile',
        fileFilter(req: Req, file, cb) {
            if (file) {
                const allowedExtensions = ['.jpeg', '.jpg', '.png'];
                const extension = path.extname(file.originalname).toLowerCase();
                const mimetype = file.mimetype;
                if (allowedExtensions.includes(extension) && (mimetype === 'image/jpeg' || mimetype === 'image/png')) {
                    cb(null, true);
                } else {
                    cb(null, false);
                }
            } else {
                cb(null, true);
            }
        },
    })
    async put(@Context('user') user: User, @Res() res: Res, @BodyParams() body: any, @MultipartFile('file') file: PlatformMulterFile) {
        if (file) {
            const mimetype = file.mimetype.substring(file.mimetype.indexOf('/') + 1);
            const fileLink = `${process.env.PRODUCTION_URL}/profile/${file.filename}.${mimetype}`;

            fs.rename(`./public/profile/${file.filename}`, `./public/profile/${file.filename}.${mimetype}`, function (err: any) {
                if (err) return res.status(500).json({ success: false, err: '' });
            });
            body.profileImage = fileLink;
        }

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

    @Authenticate('jwt')
    @Post('/upload-profile')
    @MulterOptions({
        dest: './public/profile',
        fileFilter(req: Req, file, cb) {
            const allowedExtensions = ['.jpeg', '.jpg', '.png'];
            const extension = path.extname(file.originalname).toLowerCase();
            const mimetype = file.mimetype;

            if (allowedExtensions.includes(extension) && (mimetype === 'image/jpeg' || mimetype === 'image/png')) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        },
    })
    async uploadProfile(@Context('user') user: User, @MultipartFile('file') file: PlatformMulterFile, @Res() res: Res) {
        try {
            const mimetype = file.mimetype.substring(file.mimetype.indexOf('/') + 1);

            const fileLink = `${process.env.PRODUCTION_URL}/profile/${file.filename}.${mimetype}`;

            await this.usersService.updateProfile(user._id, fileLink, res);

            fs.rename(`./public/profile/${file.filename}`, `./public/profile/${file.filename}.${mimetype}`, function (err: any) {
                if (err) return res.status(500).json({ success: false, err: '' });
            });

            return res.status(200).json({ message: 'Profile image uploaded successfully', fileLink });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
