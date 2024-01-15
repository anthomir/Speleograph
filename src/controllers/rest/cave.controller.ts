import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';
import { Authenticate, Authorize } from '@tsed/passport';
import { MulterOptions, MultipartFile, PlatformMulterFile, Req, Res } from '@tsed/common';
import { CaveService } from '../../services/cave/cave.service';
import path from 'path';
import { CaveDatabase } from 'src/models/Enum';

@Controller('/cave')
export class CaveController {
    @Inject(CaveService)
    private caveService: CaveService;

    @Authenticate('jwt')
    @Get('/search/:id')
    async getById(@Res() res: Res, @PathParams('id') id: string, @QueryParams('database') database?: string) {
        try {
            database = database ? database : CaveDatabase.GrottoCenter;

            if (database == CaveDatabase.GrottoCenter) {
                var result = await this.caveService.findById({ _id: id, isDeleted: false });
            } else {
                return res.status(400).json({ message: 'Database choice not supported' });
            }

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
    async search(
        @Res() res: Res,
        @QueryParams('name') name?: string,
        @QueryParams('country') country?: string,
        @QueryParams('resourceType') resourceType?: string,
        @QueryParams('database') database?: string,
    ) {
        try {
            database = database ? database : CaveDatabase.GrottoCenter;

            if (database == CaveDatabase.GrottoCenter) {
                var result = await this.caveService.searchByNameAutoFill(name, country, resourceType);
            } else {
                return res.status(400).json({ message: 'Database choice not supported' });
            }

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
    @Get('/coordinates/proximity')
    async proximitySearch(@Res() res: Res, @QueryParams('lat') lat: string, @QueryParams('lng') lng: string, @QueryParams('radius') radius: number) {
        try {
            const { swLat, swLng, neLat, neLng } = this.calculateBoundingBox(parseFloat(lat), parseFloat(lng), radius);
            const result = await this.caveService.geolocationCoordinateSearch(String(swLat), String(swLng), String(neLat), String(neLng));
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

    calculateBoundingBox(centerLat: number, centerLng: number, radiusInKm: number) {
        const earthRadiusInKm = 6371;

        const latOffset = (radiusInKm / earthRadiusInKm) * (180 / Math.PI);
        const lngOffset = ((radiusInKm / earthRadiusInKm) * (180 / Math.PI)) / Math.cos((centerLat * Math.PI) / 180);

        const swLat = centerLat - latOffset;
        const swLng = centerLng - lngOffset;
        const neLat = centerLat + latOffset;
        const neLng = centerLng + lngOffset;

        return { swLat, swLng, neLat, neLng };
    }

    filterCavesByDistance(caves: any, targetLat: any, targetLng: any, radiusInKm: any) {
        const filteredCaves = caves.filter((cave: any) => {
            const caveLat = parseFloat(cave.latitude);
            const caveLng = parseFloat(cave.longitude);
            const distance = this.haversine(targetLat, targetLng, caveLat, caveLng);
            return distance <= radiusInKm;
        });

        return filteredCaves;
    }

    haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const earthRadius = 6371;
        const distance = earthRadius * c;
        return distance;
    }
}
