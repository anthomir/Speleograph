import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Get, Post, Patch, Put } from '@tsed/schema';
import { Authenticate } from '@tsed/passport';
import { MulterOptions, MultipartFile, PlatformMulterFile, Req, Res } from '@tsed/common';
import { CaveObservationService } from '../../services/observation/observation.service';
import path from 'path';
import { User } from '../../models/User';
import { Role } from '../../models/Enum';
import { LocationObservationService } from '../../services/locationObservation/locationObservation.service';

//TODO: Refactor
@Controller('/locationObservation')
export class LocationObservationController {
    @Inject(LocationObservationService)
    private locationObservationService: LocationObservationService;

    @Get('/:id')
    @Authenticate('jwt')
    async findById(@Res() res: Res, @PathParams('id') id: string) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }
            const result = await this.locationObservationService.findById({ _id: id, isDeleted: false });

            if (result.status === 200) {
                return res.status(200).json({ success: true, data: result.data });
            } else if (result.status === 404) {
                return res.status(404).json({ success: false, err: result.message });
            } else {
                return res.status(500).json({ success: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ success: false, err: 'Internal server error' });
        }
    }

    @Get('/')
    @Authenticate('jwt')
    async find(
        @Context() user: User,
        @Res() res: Res,
        @QueryParams('filter') filter: string,
        @QueryParams('skip') skip: string,
        @QueryParams('take') take: string,
        @QueryParams('sortBy') sortBy: string,
    ) {
        try {
            let query = filter ? JSON.parse(filter) : {};
            if (user.role != Role.Admin) {
                query = { ...query, ...{ isDeleted: false } };
            }
            const result = await this.locationObservationService.find(query, skip, take, sortBy);
            if (result.status === 200) {
                return res.status(200).json({ success: true, data: result.data });
            } else {
                return res.status(result.status).json({ success: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    @Authenticate('jwt')
    @Post('/')
    @MulterOptions({
        dest: './public/uploads',
        fileFilter(req: Req, file, cb) {
            const extension = path.extname(file.originalname).toLowerCase();
            const mimetype = file.mimetype;
            if (extension !== '.csv' || (mimetype !== 'text/csv' && mimetype !== 'application/vnd.ms-excel')) {
                cb(null, false);
            } else {
                cb(null, true);
            }
        },
    })
    async post(@Context('user') user: User, @MultipartFile('file') file: PlatformMulterFile, @Res() res: Res, @BodyParams() body: any) {
        let response = await this.locationObservationService.postFile(res, file);

        body.filePath = response;

        return await this.locationObservationService.create(user, res, body);
    }

    @Authenticate('jwt')
    @Put('/:id')
    async update(@Context('user') user: User, @Res() res: Res, @BodyParams() body: { fileName: string }, @PathParams('id') id: string) {
        try {
            let response = await this.locationObservationService.findById({ _id: id, isDeleted: false });

            if (!response.data) {
                return res.status(404).json('observation not found');
            }

            if (user.role != Role.Admin && user._id != response.data.createdBy) {
                return res.status(401).json({ sucess: false, err: 'Requirements not met' });
            }

            return await this.locationObservationService.update(id, { fileName: body.fileName }, res);
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    //admin delete api
    @Authenticate('jwt')
    @Delete('/:id')
    async delete(@Context('user') user: User, @Res() res: Res, @PathParams('id') id: string, @QueryParams('force') force: boolean) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }

            // Checking Permissions
            let role = Role.Admin;
            const sensor = await this.locationObservationService.findById({ _id: id, isDeleted: false });
            if (!sensor.data) {
                return res.status(404).json({ sucess: false, err: 'Observation not found' });
            }
            if (user.role != role && user._id.toString() != sensor.data.createdBy.toString()) {
                return res.status(401).json({ sucess: false, err: 'Requirements not met' });
            }
            ///

            let result;
            if (force == true && user.role == Role.Admin) {
                result = await this.locationObservationService.forceDeleteById(id, user);
            } else {
                result = await this.locationObservationService.deleteById(id, user);
            }

            if (result.status === 404) {
                return res.status(404).json({ sucess: false, err: result.message });
            } else if (result.status === 200) {
                return res.status(200).json({ sucess: true, data: result.message });
            } else {
                return res.status(500).json({ sucess: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ sucess: false, err: 'Internal server error' });
        }
    }

    @Authenticate('jwt')
    @Patch('/restore')
    async restore(@Context('user') user: User, @Res() res: Res, @BodyParams('ids') ids: string[]) {
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty "ids" in the request body' });
        }

        ids.forEach((element) => {
            if (element.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }
        });

        const role = Role.Admin;
        if (user.role != role) {
            return res.status(401).json({ success: false, err: 'unauthorized' });
        }

        try {
            const result = await this.locationObservationService.restore({ _id: { $in: ids }, isDeleted: true });

            if (result.status === 200) {
                return res.status(200).json({ sucess: true, err: 'Location Observations successfully restored' });
            } else {
                return res.status(result.status).json({ message: result.message });
            }
        } catch (error) {
            return res.status(500).json({ sucess: false, err: 'Internal server error' });
        }
    }
}
