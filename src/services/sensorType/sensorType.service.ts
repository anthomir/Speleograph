import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { SensorType } from '../../models/SensorType';
import { SensorTypeEnum } from '../../models/Enum';
import { UpdateSensorTypeDto } from '../../dto/sensorType/updateSensorDto';
import { FilterQuery } from 'mongoose';
import { Notification } from '../../models/Notification';

@Service()
export class SensorTypeService implements OnInit {
    @Inject(SensorType)
    private SensorType: MongooseModel<SensorType>;
    @Inject(Notification)
    private Notification: MongooseModel<Notification>;

    // JWT
    async findById(filter: FilterQuery<SensorType>): Promise<{ status: number; data: SensorType | null; message: string | null }> {
        try {
            const sensor = await this.SensorType.findOne(filter);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            return { status: 200, data: sensor, message: 'SensorType found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async find(
        filter: FilterQuery<SensorType>,
        skip: number,
        take: number,
        sortBy: string,
    ): Promise<{ status: number; data: SensorType[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.SensorType.find(filter)
                      .limit(take ? take : 100)
                      .skip(skip ? skip : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.SensorType.find()
                      .limit(take ? take : 100)
                      .skip(skip ? skip : 0)
                      .sort(sortBy ? sortBy : undefined);

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No sensorType found' };
            }

            return { status: 200, data, message: 'SensorTypes found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: SensorType | null; message: string }> {
        try {
            let sensorFound = await this.SensorType.findOne({ $and: [{ type: body.type }, { manufacturer: body.manufacturer }] });

            if (sensorFound) {
                return { status: 409, data: null, message: 'Duplicate key error. The sensorType already exists.' };
            }
            // Create a new sensor document using the provided data
            const newSensor = await this.SensorType.create({
                name: body.name,
                properties: body.properties,
                type: body.type,
                manufacturer: body.manufacturer,
                isDefault: false,
                createdBy: body.createdBy,
            });

            return { status: 201, data: newSensor, message: 'SensorType created successfully' };
        } catch (error) {
            if (error.name === 'ValidationError') {
                return { status: 400, data: null, message: error.message };
            } else if (error.name === 'MongoError' && error.code === 11000) {
                return { status: 409, data: null, message: 'Duplicate key error. The sensorType already exists.' };
            } else {
                return { status: 500, data: null, message: error.message };
            }
        }
    }

    // JWT
    async updateSensorType(id: string, newData: UpdateSensorTypeDto): Promise<{ status: number; data: SensorType | null; message: string }> {
        try {
            const sensor = await this.SensorType.findById(id);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            const updateData: Partial<SensorType> = {};

            for (const field in newData) {
                if (field in sensor) {
                    const key = field as keyof UpdateSensorTypeDto;
                    if (key === 'properties') {
                        updateData[key] = newData[key] as string[];
                    } else {
                        updateData[key] = newData[key];
                    }
                }
            }

            const updatedSensor = await this.SensorType.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            if (updatedSensor) {
                return { status: 200, data: updatedSensor, message: 'Sensor updated successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to update the sensor' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    //isDeleted = true
    async deleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            const observation = await this.SensorType.findOne({ _id: id, isDeleted: false });

            if (!observation) {
                return { status: 404, message: 'SensorType not found' };
            }

            const data = await this.SensorType.updateOne({ _id: id }, { isDeleted: true, deletedAt: new Date() });
            if (data.modifiedCount != 1) {
                return { status: 500, message: 'Unable to delete SensorType' };
            }

            await this.Notification.create({ title: 'Delete notification', description: `SensorType soft deleted , id: ${id}` });

            return { status: 200, message: 'SensorType deleted successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async forceDeleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            const observation = await this.SensorType.findOne({ _id: id });

            if (!observation) {
                return { status: 404, message: 'SensorType not found' };
            }

            const data = await this.SensorType.deleteOne({ _id: id });

            if (data.deletedCount != 1) {
                return { status: 500, message: 'Internal server error' };
            }

            await this.Notification.create({ title: 'Delete notification', description: `SensorType force deleted , id: ${id}` });

            return { status: 200, message: 'SensorType deleted successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async restore(filter: FilterQuery<SensorType>): Promise<{ status: number; message: string }> {
        try {
            const observations = await this.SensorType.find(filter);

            if (observations.length === 0) {
                return { status: 404, message: 'No sensorType found for the provided IDs' };
            }

            const updateResult = await this.SensorType.updateMany(filter, { $set: { isDeleted: false } });

            if (updateResult.matchedCount !== observations.length) {
                return { status: 500, message: 'Not all sensor types were updated' };
            }

            return { status: 200, message: 'Observations restored successfully' };
        } catch (err) {
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
                'offset',
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
