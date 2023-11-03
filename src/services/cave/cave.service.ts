import { Inject, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import axios from 'axios';

@Service()
export class CaveService {
	async findById(@Req() req: Req, @Res() res: Res, id: string) {
		try {
			let response = await axios({
				method: 'GET',
				url: `${process.env.GROTTOCAVE_API}/caves/${id}`,
			});

			if (response.data.status == 404) {
				return res.status(404).json({ success: false, err: 'No Caves found' });
			}

			if (!response.data) {
				return res.status(404).json({ success: false, err: 'No Caves found' });
			}

			return res.status(200).json({ success: true, data: response.data });
		} catch (err) {
			if (err.response.status == 404) {
				return res.status(404).json({ success: false, err: 'No Caves found' });
			}
			return res.status(500).json({ success: true, err: err });
		}
	}

	async searchByNameAutoFill(
		@Req() req: Req,
		@Res() res: Res,
		name?: string,
		country?: string
	) {
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

			if (response.data.status == 404) {
				return res.status(404).json({ success: false, err: 'No Caves found' });
			}

			if (!response.data) {
				return res.status(404).json({ success: false, err: 'No Caves found' });
			}

			return res.status(200).json({ success: true, data: response.data });
		} catch (err) {
			if (err.response.status == 404) {
				return res.status(404).json({ success: false, err: 'No Caves found' });
			}

			return res.status(500).json({ success: true, err: err });
		}
	}

	async geolocationCoordinateSearch(
		swLat: String,
		swLng: String,
		neLat: String,
		NeLng: String
	): Promise<{ response: any; err: String | null }> {
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
			return { response: null, err: 'Unable to connect to grottoCenter' };
		}
	}

	async geolocationDataSearch(
		swLat: String,
		swLng: String,
		neLat: String,
		NeLng: String
	): Promise<{ response: any; err: String | null }> {
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
			return { response: null, err: 'Unable to connect to grottoCenter' };
		}
	}
}
