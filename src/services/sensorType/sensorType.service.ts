import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import jwt from 'jsonwebtoken';
import { SensorType } from '../../models/SensorType';
import { SensorTypeEnum } from '../../models/Enum';
import { User } from '../../models/User';

@Service()
export class SensorTypeService implements OnInit {
	@Inject(SensorType)
	private SensorType: MongooseModel<SensorType>;
	@Inject(User)
	private User: MongooseModel<User>;

	// JWT
	async find(req: Req, res: Res, filter?: any) {
		try {
			return res.status(200).json({
				success: true,
				data: filter
					? await this.SensorType.find(JSON.parse(filter))
					: await this.SensorType.find(),
			});
		} catch (err) {
			return res.status(500).json({ success: false, err: err });
		}
	}

	// JWT
	async post(req: Req, res: Res, body: any) {
		try {
			let request = { exp: undefined, iat: undefined, sub: undefined };
			request = { ...request, ...req.user };
			let user = await this.User.findById(request.sub);

			if (!user) {
				return res.status(401).json({ success: false, err: 'Unauthorized' });
			}
			return res.status(201).json({
				success: true,
				data: await this.SensorType.create({
					name: body.name,
					properties: body.properties,
					type: body.type,
					manufacturer: body.manufacturer,
					isDefault: false,
					createdBy: user.id,
				}),
			});
		} catch (err) {
			return res.status(500).json({ success: false, err: err });
		}
	}

	// Only Admin
	async delete(req: Req, res: Res, id: string) {
		try {
			let user: any = req.user;
			if (!user || user.role != user.Admin) {
				return res.status(200).json({
					success: false,
					err: 'Access denied, This is only available for administrators',
				});
			}

			return res.status(200).json({
				success: true,
				data: await this.SensorType.deleteOne({ _id: id }),
			});
		} catch (err) {
			return res.status(200).json({ success: false, err: err });
		}
	}

	//Initialise the Sensor Data
	async $onInit() {
		try {
			const sensorCount = (await this.SensorType.find()).length;

			if (sensorCount > 0) {
				return;
			}
			let reefArray: Array<string> = new Array(
				'Encoding',
				'SensorId',
				'Timestamp',
				'AAAA',
				'MM',
				'JJ',
				'HH',
				'mm',
				'ss',
				'Pressure(hPa)',
				'Temperature(Kelvin) 1',
				'Temperature(Kelvin) 2'
			);
			let ctdArray: Array<string> = new Array(
				'Date-Time',
				'Pressure(cmH20)',
				'Temperature(C)',
				'Conductivity'
			);
			let pluvioArray: Array<string> = new Array('Date-Time', 'RainMeter');

			await this.SensorType.create({
				name: SensorTypeEnum.ReefNet,
				properties: reefArray,
				isDefault: true,
			});
			await this.SensorType.create({
				name: SensorTypeEnum.CTDSensor,
				properties: ctdArray,
				isDefault: true,
			});
			await this.SensorType.create({
				name: SensorTypeEnum.PluvioMeter,
				properties: pluvioArray,
				isDefault: true,
			});

			console.log('Default Sensor Creation Successful');
			return;
		} catch (err) {
			console.log('Error while initializing the Default sensors: ' + err);
		}
	}
}
