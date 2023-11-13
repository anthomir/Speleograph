import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Delete, Put, Patch } from '@tsed/schema';
import { Authenticate } from '@tsed/passport';
import { Res } from '@tsed/common';
import { SensorTypeService } from '../../services/sensorType/sensorType.service';
import { User } from '../../models/User';
import { UpdateSensorTypeDto } from '../../dto/sensorType/updateSensorDto';
import { Role } from '../../models/Enum';

@Controller('/sensorType')
export class SensorTypeController {
    @Inject(SensorTypeService)
    private sensorTypeService: SensorTypeService;

    @Get('/:id')
    @Authenticate('jwt')
    async findById(@Res() res: Res, @PathParams('id') id: string) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }
            const result = await this.sensorTypeService.findById({ _id: id, isDeleted: false });

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
        @Res() res: Res,
        @QueryParams('filter') filter: string,
        @QueryParams('skip') skip: number,
        @QueryParams('take') take: number,
        @QueryParams('sortBy') sortBy: string,
    ) {
        try {
            let query = filter ? filter : {};
            query = { ...query, ...{ isDeleted: false } };

            const result = await this.sensorTypeService.find(query, skip, take, sortBy);
            if (result.status === 200) {
                return res.status(200).json({ success: false, data: result.data });
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
            const result = await this.sensorTypeService.post(body);
            if (result.status === 201) {
                return res.status(201).json({ sucess: true, data: result.data });
            } else {
                return res.status(500).json({ sucess: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ sucess: false, err: 'Internal server error' });
        }
    }

    @Put('/:id')
    @Authenticate('jwt')
    async update(@Res() res: Res, @PathParams('id') id: string, @BodyParams() body: UpdateSensorTypeDto) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, message: 'Bad request' });
            }

            const result = await this.sensorTypeService.updateSensorType(id, body);
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
    async delete(@Context('user') user: User, @Res() res: Res, @PathParams('id') id: string, @QueryParams('force') force: boolean) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }
            // Checking Permissions
            const sensor = await this.sensorTypeService.findById({ _id: id, isDeleted: false });
            if (!sensor.data) {
                return res.status(404).json({ sucess: false, err: 'SensorType not found' });
            }
            let role = Role.Admin;
            if (!sensor.data.createdBy) {
                return res.status(401).json({ sucess: false, err: 'Requirements not met' });
            }

            if (user.role != role && user._id.toString() != sensor.data.createdBy.toString()) {
                return res.status(401).json({ sucess: false, err: 'Requirements not met' });
            }
            ///

            let result;
            if (force == true && user.role == Role.Admin) {
                result = await this.sensorTypeService.forceDeleteById(id);
            } else {
                result = await this.sensorTypeService.deleteById(id);
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
            const result = await this.sensorTypeService.restore({ _id: { $in: ids }, isDeleted: true });

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
