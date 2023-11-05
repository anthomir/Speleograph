import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Delete, Put } from '@tsed/schema';
import { Authenticate } from '@tsed/passport';
import { Res } from '@tsed/common';
import { User } from '../../models/User';
import { SensorService } from '../../services/sensor/sensor.service';
import { UpdateSensorDto } from '../../dto/sensor/updateSensor';

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

            const result = await this.sensorService.findById(id);

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
        @QueryParams('skip') skip: string,
        @QueryParams('take') take: string,
        @QueryParams('sortBy') sortBy: string,
    ) {
        try {
            const result = await this.sensorService.find(filter, skip, take, sortBy);
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
            const result = await this.sensorService.post(body);
            if (result.status === 201) {
                return res.status(201).json({ sucess: true, data: result.data });
            } else {
                return res.status(500).json({ sucess: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ sucess: false, err: 'Internal server error' });
        }
    }

    @Delete('/:id')
    @Authenticate('jwt')
    async delete(@Res() res: Res, @PathParams('id') id: string) {
        try {
            const result = await this.sensorService.deleteById(id);
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

    @Put('/:id')
    @Authenticate('jwt')
    async update(@Res() res: Res, @PathParams('id') id: string, @BodyParams() body: UpdateSensorDto) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, message: 'Bad request' });
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
}
