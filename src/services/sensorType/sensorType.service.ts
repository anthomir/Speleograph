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
    async find(filter?: any): Promise<{ response: any; err: String | null }> {
        try {
            const data = filter ? await this.SensorType.find(JSON.parse(filter)) : await this.SensorType.find();

            if (data.length == 0) {
                return { response: null, err: null };
            }

            return { response: data, err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ response: any; err: String | null }> {
        try {
            const response = await this.SensorType.create({
                name: body.name,
                properties: body.properties,
                type: body.type,
                manufacturer: body.manufacturer,
                isDefault: false,
                createdBy: body.id,
            });

            return { response, err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error' };
        }
    }

    // Only Admin
    async delete(id: string): Promise<{ response: any; err: String | null }> {
        try {
            const data = await this.SensorType.deleteOne({ _id: id });

            if (data.deletedCount == 0) {
                return {
                    response: null,
                    err: 'Delete Failed: We encountered an issue while attempting to delete the data',
                };
            }
            return { response: 'Deleted successfully', err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error' };
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
                'Temperature(Kelvin) 2',
            );
            let ctdArray: Array<string> = new Array('Date-Time', 'Pressure(cmH20)', 'Temperature(C)', 'Conductivity');
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
