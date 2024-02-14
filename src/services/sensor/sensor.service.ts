import { SensorType } from './../../models/SensorType';
import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { UpdateSensorDto } from '../../dto/sensor/updateSensor';
import { Sensor } from '../../models/Sensor';
import { FilterQuery } from 'mongoose';
import { Notification } from '../../models/Notification';
import { ItemType, NotificationType } from '../../models/Enum';
import { User } from '../../models/User';

@Service()
export class SensorService {
    @Inject(Sensor)
    private Sensor: MongooseModel<Sensor>;
    @Inject(SensorType)
    private SensorType: MongooseModel<SensorType>;

    @Inject(Notification)
    private Notification: MongooseModel<Notification>;
    // JWT
    async findById(filter: any): Promise<{ status: number; data: Sensor | null; message: string | null }> {
        try {
            const sensor = await this.Sensor.findOne(filter);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }
            return { status: 200, data: sensor, message: 'Sensor found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async find(filter: any, skip: string, take: string, sortBy: string): Promise<{ status: number; data: Sensor[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.Sensor.find(filter)
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                      .populate('sensorTypeId')
                : await this.Sensor.find()
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                      .populate('sensorTypeId');

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No sensors found' };
            }

            return { status: 200, data, message: 'Sensors found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: error.message };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: Sensor | null; message: string }> {
        try {
            const sensorType = await this.SensorType.findById(body.sensorTypeId);

            if (!sensorType) {
                return { status: 400, data: null, message: 'Sensor Type not found' };
            }

            const newSensor = await this.Sensor.create({
                name: body.name,
                serialNo: body.serialNo,
                sensorTypeId: body.sensorTypeId,
                createdBy: body.createdBy,
                observes: sensorType.properties,
            });

            if (newSensor) {
                return { status: 201, data: newSensor, message: 'Sensor created successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to create the sensor' };
            }
        } catch (error) {
            if (error.name === 'ValidationError') {
                return { status: 400, data: null, message: error.message };
            } else if (error.name === 'MongoError' && error.code === 11000) {
                return { status: 409, data: null, message: 'Duplicate key error. The sensor already exists.' };
            } else {
                return { status: 500, data: null, message: error.message };
            }
        }
    }

    // JWT
    async updateSensor(id: string, newData: UpdateSensorDto): Promise<{ status: number; data: Sensor | null; message: string }> {
        try {
            const sensor = await this.Sensor.findById(id);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            const updateData: Partial<Sensor> = {};

            for (const field in newData) {
                if (field in sensor) {
                    const key = field as keyof UpdateSensorDto;
                    updateData[key] = newData[key];
                }
            }

            const updatedSensor = await this.Sensor.findByIdAndUpdate(id, updateData, {
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
    async deleteById(id: string, deletedBy: User): Promise<{ status: number; message: string }> {
        try {
            const sensor = await this.Sensor.findOne({ _id: id, isDeleted: false });

            if (!sensor) {
                return { status: 404, message: 'Sensor not found' };
            }

            const data = await this.Sensor.updateOne({ _id: id }, { isDeleted: true, deletedAt: new Date() });
            if (data.modifiedCount != 1) {
                return { status: 500, message: 'Unable to delete Sensor' };
            }

            await this.Notification.create({
                title: 'Delete notification',
                notificationType: NotificationType.SoftDelete,
                itemType: ItemType.Sensor,
                sensor: sensor._id,
                deletedBy: deletedBy._id,
            });

            return { status: 200, message: 'Sensor deleted successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async forceDeleteById(id: string, deletedBy: User): Promise<{ status: number; message: string }> {
        try {
            const sensor = await this.Sensor.findOne({ _id: id });

            if (!sensor) {
                return { status: 404, message: 'Sensor not found' };
            }

            const data = await this.Sensor.deleteOne({ _id: id });

            if (data.deletedCount != 1) {
                return { status: 500, message: 'Internal server error' };
            }
            await this.Notification.create({
                title: 'Delete notification',
                notificationType: NotificationType.HardDelete,
                itemType: ItemType.Sensor,
                sensor: sensor._id,
                deletedBy: deletedBy._id,
            });

            return { status: 200, message: 'Sensor deleted successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async restore(filter: FilterQuery<Sensor>): Promise<{ status: number; message: string }> {
        try {
            const observations = await this.Sensor.find(filter);

            if (observations.length === 0) {
                return { status: 404, message: 'No sensor found for the provided IDs' };
            }

            const updateResult = await this.Sensor.updateMany(filter, { $set: { isDeleted: false, deletedAt: null } });

            if (updateResult.matchedCount !== observations.length) {
                return { status: 500, message: 'Not all sensors were updated' };
            }

            return { status: 200, message: 'Sensors restored successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }
}
