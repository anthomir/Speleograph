import { Service } from '@tsed/common';
import axios from 'axios';

@Service()
export class CaveService {
    // response: data, err: null ==> sucess
    // response: null, err: null ==> 404
    // response: null, err: err  ==> err
    async findById(filter: any): Promise<{ status: number; data: any | null; message: string | null }> {
        try {
            const response = await axios.get(`${process.env.GROTTOCAVE_API}/caves/${filter._id}`);

            if (!response.data) {
                return { status: 404, data: null, message: 'Cave not found' };
            }

            return { status: 200, data: response.data, message: 'Cave found successfully' };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return { status: 404, data: null, message: 'Cave not found' };
            }
            return { status: 500, data: null, message: 'Unable to connect to Grottocenter' };
        }
    }

    // response: data, err: null ==> sucess
    // response: null, err: null ==> 404
    // response: null, err: err  ==> err
    async searchByNameAutoFill(
        name?: string,
        country?: string,
        resourceType?: string,
    ): Promise<{ status: number; data: any | null; message: string | null }> {
        try {
            const response = await axios.post(`${process.env.GROTTOCAVE_API}/advanced-search`, null, {
                params: {
                    complete: true,
                    resourceType: resourceType ? resourceType : 'caves',
                    name: name || undefined,
                    country: country || undefined,
                },
            });

            if (response.data.length === 0) {
                return { status: 200, data: null, message: 'No caves found' };
            }

            return { status: 200, data: response.data, message: 'Caves found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Unable to connect to Grottocenter' };
        }
    }

    // response: data, err: null ==> sucess
    // response: null, err: null ==> 404
    // response: null, err: err  ==> err
    async geolocationCoordinateSearch(
        swLat: string,
        swLng: string,
        neLat: string,
        neLng: string,
    ): Promise<{ status: number; data: any | null; message: string | null }> {
        try {
            const response = await axios.get(`${process.env.GROTTOCAVE_API}/geoloc/entrancesCoordinates`, {
                params: {
                    sw_lat: swLat,
                    sw_lng: swLng,
                    ne_lat: neLat,
                    ne_lng: neLng,
                },
            });

            if (response.data.length === 0) {
                return { status: 200, data: null, message: 'No entrances found' };
            }

            return { status: 200, data: response.data, message: 'Entrances found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Unable to connect to GrottoCenter' };
        }
    }

    // response: data, err: null ==> sucess
    // response: null, err: null ==> 404
    // response: null, err: err  ==> err
    async geolocationDataSearch(
        swLat: string,
        swLng: string,
        neLat: string,
        neLng: string,
    ): Promise<{ status: number; data: any | null; message: string | null }> {
        try {
            const response = await axios.get(`${process.env.GROTTOCAVE_API}/geoloc/entrances`, {
                params: {
                    sw_lat: swLat,
                    sw_lng: swLng,
                    ne_lat: neLat,
                    ne_lng: neLng,
                },
            });

            if (response.data.length === 0) {
                return { status: 200, data: null, message: 'No entrances found' };
            }

            return { status: 200, data: response.data, message: 'Entrances found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Unable to connect to GrottoCenter' };
        }
    }
}
