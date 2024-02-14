import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, PathParams, QueryParams, ValidationPipe } from '@tsed/platform-params';
import { Get, Post, Delete, Put, Patch } from '@tsed/schema';
import { Authenticate } from '@tsed/passport';
import { Req, Res, Use } from '@tsed/common';
import { User } from '../../models/User';
import { SensorService } from '../../services/sensor/sensor.service';
import { UpdateSensorDto } from '../../dto/sensor/updateSensor';
import { Role } from '../../models/Enum';

@Controller('/sensor')
export class SensorController {
    @Inject(SensorService)
    private sensorService: SensorService;

    @Get('/:id')
    @Authenticate('jwt')
    async findById(@Res() res: Res, @PathParams('id') id: string) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }
            const result = await this.sensorService.findById({ _id: id, isDeleted: false });

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
        @Context('user') user: User,
        @Res() res: Res,
        @QueryParams('filter') filter: string,
        @QueryParams('skip') skip: string,
        @QueryParams('take') take: string,
        @QueryParams('sortBy') sortBy: string,
    ) {
        try {
            let query = filter ? JSON.parse(filter) : {};
            if (user.role == Role.User) {
                query = { ...query, ...{ isDeleted: false } };
            }

            const result = await this.sensorService.find(query, skip, take, sortBy);
            if (result.status === 200) {
                return res.status(200).json({ success: true, data: result.data });
            } else {
                return res.status(result.status).json({ success: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    @Post('/')
    @Authenticate('jwt')
    async post(@Context('user') user: User, @Res() res: Res, @BodyParams() body?: any) {
        body.createdBy = user._id;
        try {
            const result = await this.sensorService.post(body);
            if (result.status === 201) {
                return res.status(201).json({ sucess: true, data: result.data });
            } else {
                return res.status(result.status).json({ sucess: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ sucess: false, err: 'Internal server error' });
        }
    }

    @Put('/:id')
    @Authenticate('jwt')
    async update(@Context('user') user: User, @Res() res: Res, @PathParams('id') id: string, @BodyParams() body: UpdateSensorDto) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }
            const sensor = await this.sensorService.findById({ _id: id, isDeleted: false });
            if (!sensor.data) {
                return res.status(404).json({ sucess: false, err: 'Sensor not found' });
            }

            let role = Role.Admin;
            if (user.role != role && user._id.toString() != sensor.data.createdBy.toString()) {
                return res.status(401).json({ sucess: false, err: 'Requirements not met' });
            }

            const result = await this.sensorService.updateSensor(id, body);
            if (result.status === 404) {
                return res.status(404).json({ sucess: false, err: result.message });
            } else if (result.status === 200) {
                return res.status(200).json({ sucess: true, data: result.data });
            } else {
                return res.status(500).json({ sucess: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ sucess: false, err: 'Internal server error' });
        }
    }

    @Delete('/:id')
    @Authenticate('jwt')
    async delete(@Context('user') user: User, @Req() req: Req, @Res() res: Res, @PathParams('id') id: string, @QueryParams('force') force: boolean) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }

            // Checking Permissions
            const sensor = await this.sensorService.findById({ _id: id });
            if (!sensor.data) {
                return res.status(404).json({ sucess: false, err: 'Sensor not found' });
            }
            let role = Role.Admin;
            if (user.role != role && user._id.toString() != sensor.data.createdBy.toString()) {
                return res.status(401).json({ sucess: false, err: 'Requirements not met' });
            }
            ///

            let result;
            if (force == true && user.role == Role.Admin) {
                result = await this.sensorService.forceDeleteById(id, user);
            } else {
                result = await this.sensorService.deleteById(id, user);
            }

            if (result.status === 404) {
                return res.status(404).json({ sucess: false, err: result.message });
            } else if (result.status === 200) {
                return res.status(200).json({ sucess: true, data: result.message });
            } else {
                return res.status(500).json({ sucess: true, err: result.message });
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
            const result = await this.sensorService.restore({ _id: { $in: ids }, isDeleted: true });

            if (result.status === 200) {
                return res.status(200).json({ sucess: true, err: 'Observations successfully restored' });
            } else {
                return res.status(result.status).json({ message: result.message });
            }
        } catch (error) {
            return res.status(500).json({ sucess: false, err: 'Internal server error' });
        }
    }
}
