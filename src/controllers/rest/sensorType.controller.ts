import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Delete } from '@tsed/schema';
import { Authenticate } from '@tsed/passport';
import { Req, Res } from '@tsed/common';
import { SensorTypeService } from '../../services/sensorType/sensorType.service';
import { User } from 'src/models/User';
import { Role } from 'src/models/Enum';

@Controller('/sensorType')
export class SensorTypeController {
    @Inject(SensorTypeService)
    private sensorTypeService: SensorTypeService;

    @Get('/')
    @Authenticate('jwt')
    async get(@Res() res: Res, @QueryParams('filter') filter?: string) {
        const response = await this.sensorTypeService.find(filter);
        if (response.response == null && response.err == null) {
            return res.status(404).json({ success: false, err: 'Data not found' });
        }
        if (response.err) {
            return res.status(500).json({ success: false, err: response.err });
        }

        return res.status(200).json({ success: true, err: response.response });
    }

    @Post('/')
    @Authenticate('jwt')
    async post(@Context('user') user: User, @Res() res: Res, @BodyParams() body?: any) {
        body.createdBy = user._id;
        const objRes = await this.sensorTypeService.post(body);
        if (objRes.err) {
            return res.status(500).json({ success: false, err: 'err: ' + objRes.err });
        }
        return res.status(201).json({ success: true, data: objRes.response });
    }

    @Delete('/:id')
    @Authenticate('jwt')
    async delete(@Context('user') user: User, @Res() res: Res, @PathParams('id') id: string) {
        if (user.role != Role.Admin) {
            return res.status(401).json({ success: false, err: 'unauthorized' });
        }

        if (!id) {
            return res.status(400).json({ success: false, err: 'Bad request' });
        }

        const data = await this.sensorTypeService.delete(id);

        if (data.err) {
            return res.status(500).json({ success: false, err: data.err });
        }

        return res.status(200).json({ success: true, data: data.response });
    }
}
