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
        try {
            const result = await this.caveService.findById({ _id: id, isDeleted: false });
            if (result.status === 200) {
                return res.status(200).json(result.data);
            } else if (result.status === 404) {
                return res.status(404).json({ message: result.message });
            } else {
                return res.status(500).json({ message: result.message });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    @Authenticate('jwt')
    @Get('/search')
    async search(@Res() res: Res, @QueryParams('name') name?: string, @QueryParams('country') country?: string) {
        try {
            const result = await this.caveService.searchByNameAutoFill(name, country);
            if (result.status === 200) {
                return res.status(200).json(result.data);
            } else {
                return res.status(result.status).json({ message: result.message });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    @Authenticate('jwt')
    @Get('/coordinates/geolocation')
    async coordinatesByGeolocation(
        @Res() res: Res,
        @QueryParams('sw_lat') swLat: string,
        @QueryParams('sw_lng') swLng: string,
        @QueryParams('ne_lat') neLat: string,
        @QueryParams('ne_lng') neLng: string,
    ) {
        try {
            const result = await this.caveService.geolocationCoordinateSearch(swLat, swLng, neLat, neLng);
            if (result.status === 200) {
                return res.status(200).json(result.data);
            } else {
                return res.status(result.status).json({ message: result.message });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    @Authenticate('jwt')
    @Get('/data/geolocation')
    async CavesByGeolocation(
        @Res() res: Res,
        @QueryParams('sw_lat') swLat: string,
        @QueryParams('sw_lng') swLng: string,
        @QueryParams('ne_lat') neLat: string,
        @QueryParams('ne_lng') neLng: string,
    ) {
        try {
            const result = await this.caveService.geolocationDataSearch(swLat, swLng, neLat, neLng);
            if (result.status === 200) {
                return res.status(200).json(result.data);
            } else {
                return res.status(result.status).json({ message: result.message });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
