import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';
import { Authenticate, Authorize } from '@tsed/passport';
import { MulterOptions, MultipartFile, PlatformMulterFile, Req, Res } from '@tsed/common';
import { CaveService } from '../../services/cave/cave.service';
import path from 'path';

@Controller('/cave')
export class CaveController {
    @Inject(CaveService)
    private caveService: CaveService;

    @Authenticate('jwt')
    @Get('/search/:id')
    async getById(@Res() res: Res, @PathParams('id') id: string) {
        const objRes = await this.caveService.findById(id);

        if (objRes.response == null && objRes.err == null) {
            return res.status(404).json({ success: false, err: 'No caves found' });
        }

        if (objRes.err) {
            return res.status(500).json({ success: false, err: objRes.err });
        }

        return res.status(200).json({ success: true, data: objRes.response });
    }

    @Authenticate('jwt')
    @Get('/search')
    async search(@Res() res: Res, @QueryParams('name') name?: string, @QueryParams('country') country?: string) {
        const objRes = await this.caveService.searchByNameAutoFill(name, country);

        if (objRes.response == null && objRes.err == null) {
            return res.status(404).json({ success: false, err: 'No caves found' });
        }

        if (objRes.err) {
            return res.status(500).json({ success: false, err: objRes.err });
        }

        return res.status(200).json({ success: true, data: objRes.response });
    }

    @Authenticate('jwt')
    @Get('/coordinates/geolocation')
    async coordinatesByGeolocation(
        @Res() res: Res,
        @QueryParams('sw_lat') sw_lat: string,
        @QueryParams('sw_lng') sw_lng: string,
        @QueryParams('ne_lat') ne_lat: string,
        @QueryParams('ne_lng') ne_lng: string,
    ) {
        const objRes = await this.caveService.geolocationCoordinateSearch(sw_lat, sw_lng, ne_lat, ne_lng);

        if (objRes.response == null && objRes.err == null) {
            return res.status(404).json({ success: false, err: 'No coordinates found' });
        }

        if (objRes.err) {
            return res.status(500).json({ success: false, err: objRes.err });
        }

        return res.status(200).json({ success: true, data: objRes.response });
    }

    @Authenticate('jwt')
    @Get('/data/geolocation')
    async CavesByGeolocation(
        @Res() res: Res,
        @QueryParams('sw_lat') sw_lat: string,
        @QueryParams('sw_lng') sw_lng: string,
        @QueryParams('ne_lat') ne_lat: string,
        @QueryParams('ne_lng') ne_lng: string,
    ) {
        const objRes = await this.caveService.geolocationDataSearch(sw_lat, sw_lng, ne_lat, ne_lng);

        if (objRes.response == null && objRes.err == null) {
            return res.status(404).json({ success: false, err: 'no caves found' });
        }
        if (objRes.err) {
            return res.status(500).json({ success: false, err: objRes.err });
        }
        return res.status(200).json({ success: true, data: objRes.response });
    }
}
