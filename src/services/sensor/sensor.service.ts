import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel, ObjectID } from '@tsed/mongoose';
import jwt from 'jsonwebtoken';
import { Sensor } from '../../models/Sensor';
import { User } from '../../models/User';

@Service()
export class SensorService {
	@Inject(Sensor)
	private Sensor: MongooseModel<Sensor>;
	@Inject(User)
	private User: MongooseModel<User>;

	// JWT
	async find(req: Req, res: Res, skip?: string, take?: string) {
		try {
			let request = { exp: undefined, iat: undefined, sub: undefined };
			request = { ...request, ...req.user };

			let user = await this.User.findById(request.sub);

			if (!user) {
				return res.status(500).json({ success: true, err: 'unauthorized' });
			}

			return res.status(200).json({
				success: true,
				data: await this.Sensor.find({ createdBy: user.id })
					.skip(skip ? parseInt(skip) : 0)
					.limit(take ? parseInt(take) : 100),
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
				return res.status(500).json({ success: true, err: 'unauthorized' });
			}

			return res.status(201).json({
				success: true,
				data: await this.Sensor.create({
					name: body.name,
					sensorTypeId: body.sensorTypeId,
					serialNo: body.serialNo,
					createdBy: user.id,
				}),
			});
		} catch (err) {
			return res.status(500).json({ success: false, err: err });
		}
	}

	// JWT
	async delete(req: Req, res: Res, id: string) {
		try {
			let request = { exp: undefined, iat: undefined, sub: undefined };
			request = { ...request, ...req.user };

			let user = await this.User.findById(request.sub);
			let sensor = await this.Sensor.findById(id);

			if (!user) {
				return res.status(500).json({ success: true, err: 'unauthorized' });
			}
			if (!sensor) {
				return res
					.status(404)
					.json({ success: false, err: 'Sensor not found' });
			}

			if (sensor.createdBy != user.id) {
				return res.status(401).json({
					success: false,
					err: 'Unauthorized Deletion of unowned sensors',
				});
			}

			return res.status(200).json({
				success: true,
				data: await this.Sensor.deleteOne({ _id: id }),
			});
		} catch (err) {
			return res.status(500).json({ success: false, err: err });
		}
	}

	// JWT
	async update(req: Req, res: Res, id: string, body: any) {
		try {
			let user: any | undefined = req.user;
			let sensor = await this.Sensor.findById(id);
			if (!sensor) {
				return res
					.status(404)
					.json({ success: false, err: 'Sensor not found' });
			}

			if (sensor.createdBy != user.sub) {
				return res.status(401).json({
					success: false,
					err: 'Unauthorized Change of unowned sensors',
				});
			}

			sensor.name = body.name ? body.name : sensor.name;
			sensor.serialNo = body.serialNo ? body.serialNo : sensor.serialNo;
			sensor.save();

			return res.status(200).json({ success: true, data: sensor });
		} catch (err) {
			return res.status(500).json({ success: false, err: err });
		}
	}
}
