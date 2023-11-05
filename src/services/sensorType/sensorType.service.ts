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

    // JWT
    async findById(id: string): Promise<{ status: number; data: SensorType | null; message: string | null }> {
        try {
            const sensor = await this.SensorType.findById(id);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            return { status: 200, data: sensor, message: 'Sensor found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async find(
        filter: any,
        skip: string,
        take: string,
        sortBy: string,
    ): Promise<{ status: number; data: SensorType[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.SensorType.find(JSON.parse(filter))
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.SensorType.find()
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined);

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No sensors found' };
            }

            return { status: 200, data, message: 'Sensors found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: SensorType | null; message: string }> {
        try {
            // Create a new sensor document using the provided data
            const newSensor = await this.SensorType.create({
                name: body.name,
                properties: body.properties,
                type: body.type,
                manufacturer: body.manufacturer,
                isDefault: false,
                createdBy: body.createdBy,
            });

            if (newSensor) {
                return { status: 201, data: newSensor, message: 'Sensor created successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to create the sensor' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    //TODO: Update

    // Only Admin
    async deleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            // Find the sensor by its _id and delete it
            const result = await this.SensorType.deleteOne({ _id: id });

            if (result.deletedCount === 1) {
                return { status: 200, message: 'Sensor deleted successfully' };
            } else {
                return { status: 404, message: 'Sensor not found' };
            }
        } catch (error) {
            return { status: 500, message: 'Internal server error' };
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
