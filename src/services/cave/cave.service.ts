import { Inject, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import axios from 'axios';

@Service()
export class CaveService {
    // response: data, err: null ==> sucess
    // response: null, err: null ==> 404
    // response: null, err: err  ==> err
    async findById(id: string): Promise<{ response: any; err: String | null }> {
        try {
            let response = await axios({
                method: 'GET',
                url: `${process.env.GROTTOCAVE_API}/caves/${id}`,
            });

            if (!response.data) {
                return { response: null, err: null };
            }

            return { response: response.data, err: null };
        } catch (err) {
            if (err.response.status == 404) {
                return { response: null, err: null };
            }
            return { response: null, err: 'unable to connect to grottocenter' };
        }
    }

    // response: data, err: null ==> sucess
    // response: null, err: null ==> 404
    // response: null, err: err  ==> err
    async searchByNameAutoFill(name?: string, country?: string): Promise<{ response: any; err: String | null }> {
        try {
            let response = await axios({
                method: 'POST',
                url: `${process.env.GROTTOCAVE_API}/advanced-search`,
                params: {
                    complete: true,
                    resourceType: 'entrances',
                    name: name ? name : undefined,
                    country: country ? country : undefined,
                },
            });

            if (response.data.length == 0) {
                return { response: null, err: null };
            }

            return { response: response.data, err: null };
        } catch (err) {
            return { response: null, err: 'unable to connect to grottocenter' };
        }
    }

    // response: data, err: null ==> sucess
    // response: null, err: null ==> 404
    // response: null, err: err  ==> err
    async geolocationCoordinateSearch(swLat: String, swLng: String, neLat: String, NeLng: String): Promise<{ response: any; err: String | null }> {
        try {
            let response = await axios({
                method: 'GET',
                url: `${process.env.GROTTOCAVE_API}/geoloc/entrancesCoordinates`,
                params: {
                    sw_lat: swLat,
                    sw_lng: swLng,
                    ne_lat: neLat,
                    ne_lng: NeLng,
                },
            });

            if (response.data.length == 0) {
                return { response: null, err: null };
            }

            return { response: response.data, err: null };
        } catch (err) {
            return { response: null, err: 'unable to connect to grottoCenter' };
        }
    }

    // response: data, err: null ==> sucess
    // response: null, err: null ==> 404
    // response: null, err: err  ==> err
    async geolocationDataSearch(swLat: String, swLng: String, neLat: String, NeLng: String): Promise<{ response: any; err: String | null }> {
        try {
            let response = await axios({
                method: 'GET',
                url: `${process.env.GROTTOCAVE_API}/geoloc/entrances`,
                params: {
                    sw_lat: swLat,
                    sw_lng: swLng,
                    ne_lat: neLat,
                    ne_lng: NeLng,
                },
            });

            if (response.data.length == 0) {
                return { response: null, err: null };
            }

            return { response: response.data, err: null };
        } catch (err) {
            return { response: null, err: 'unable to connect to grottoCenter' };
        }
    }
}
