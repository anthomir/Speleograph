import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Delete, Put } from '@tsed/schema';
import { Authenticate } from '@tsed/passport';
import { Req, Res } from '@tsed/common';
import { AreaService } from '../../services/area/area.service';

@Controller('/area')
export class AreaController {
    @Inject(AreaService)
    private areaService: AreaService;

    @Get('/')
    @Authenticate('jwt')
    async get(@Res() res: Res, @QueryParams('filter') filter: string, @QueryParams('skip') skip: string, @QueryParams('take') take: string, @QueryParams('sortBy') sortBy: string) {
        let objRes = await this.areaService.find(filter, skip, take, sortBy);

        if (objRes.response == null && objRes.err == null) {
            return res.status(404).json({ success: false, err: 'No areas found' });
        }

        if (objRes.err) {
            return res.status(500).json({ success: false, err: objRes.err });
        }

        return res.status(200).json({ success: true, data: objRes.response });
    }

    @Post('/')
    @Authenticate('jwt')
    async post(@Res() res: Res, @BodyParams() body?: any) {
        const objRes = await this.areaService.post(body);

        if (objRes.err) {
            return res.status(500).json({ success: false, err: 'err: ' + objRes.err });
        }

        return res.status(201).json({ success: true, data: objRes.response });
    }

    @Delete('/:id')
    @Authenticate('jwt')
    async delete(@Req() req: Req, @Res() res: Res, @PathParams('id') id: string) {
        if (!id) {
            return res.status(400).json({ success: false, err: 'Bad request' });
        }
        const data = await this.areaService.delete(id);

        if (data.err) {
            return res.status(500).json({ success: false, err: data.err });
        }

        return res.status(200).json({ success: true, data: data.response });
    }
}
