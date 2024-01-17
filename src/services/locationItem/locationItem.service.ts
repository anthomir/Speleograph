import { LocationItem } from './../../models/locationItem';
import { SensorType } from './../../models/SensorType';
import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { ItemType, NotificationType, SensorTypeEnum } from '../../models/Enum';
import { UpdateSensorTypeDto } from '../../dto/sensorType/updateSensorDto';
import { FilterQuery } from 'mongoose';
import { Notification } from '../../models/Notification';
import { User } from 'src/models/User';

@Service()
export class LocationItemService {
    @Inject(LocationItem)
    private LocationItem: MongooseModel<LocationItem>;
    @Inject(Notification)
    private Notification: MongooseModel<Notification>;

    // JWT
    async findById(filter: FilterQuery<SensorType>): Promise<{ status: number; data: LocationItem | null; message: string | null }> {
        try {
            const sensor = await this.LocationItem.findOne(filter);

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
    ): Promise<{ status: number; data: LocationItem[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.LocationItem.find(filter)
                      .limit(take ? take : 100)
                      .skip(skip ? skip : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.LocationItem.find()
                      .limit(take ? take : 100)
                      .skip(skip ? skip : 0)
                      .sort(sortBy ? sortBy : undefined);

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No sensorType found' };
            }

            return { status: 200, data, message: 'LocationItem found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: LocationItem | null; message: string }> {
        try {
            let sensorFound = await this.LocationItem.findOne({ $and: [{ type: body.type }, { manufacturer: body.manufacturer }] });

            if (sensorFound) {
                return { status: 409, data: null, message: 'Duplicate key error. The sensorType already exists.' };
            }
            const newSensor = await this.LocationItem.create({
                lng: body.lng,
                lat: body.lat,
                name: body.name,
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
    async updateSensorType(id: string, newData: any): Promise<{ status: number; data: LocationItem | null; message: string }> {
        try {
            const locationItem = await this.LocationItem.findById(id);

            if (!locationItem) {
                return { status: 404, data: null, message: 'LocationItem not found' };
            }

            const updatedLocationItem = await this.LocationItem.findByIdAndUpdate(id, {
                name: newData.name ? newData.name : locationItem.name,
                lng: newData.lng ? newData.lng : locationItem.lng,
                lat: newData.lat ? newData.lat : locationItem.lat,
            });

            if (updatedLocationItem) {
                return { status: 200, data: updatedLocationItem, message: 'LocationItem updated successfully' };
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
            const locationItem = await this.LocationItem.findOne({ _id: id, isDeleted: false });

            if (!locationItem) {
                return { status: 404, message: 'LocationItem not found' };
            }

            const data = await this.LocationItem.updateOne({ _id: id }, { isDeleted: true, deletedAt: new Date() });
            if (data.modifiedCount != 1) {
                return { status: 500, message: 'Unable to delete locationItem' };
            }

            await this.Notification.create({
                title: 'Delete notification',
                notificationType: NotificationType.SoftDelete,
                itemType: ItemType.LocationItem,
                locationItem: locationItem._id,
                deletedBy: deletedBy._id,
            });

            return { status: 200, message: 'locationItem deleted successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async forceDeleteById(id: string, deletedBy: User): Promise<{ status: number; message: string }> {
        try {
            const sensorType = await this.LocationItem.findOne({ _id: id });

            if (!sensorType) {
                return { status: 404, message: 'locationItem not found' };
            }

            const data = await this.LocationItem.deleteOne({ _id: id });

            if (data.deletedCount != 1) {
                return { status: 500, message: 'Internal server error' };
            }

            await this.Notification.create({
                title: 'Delete notification',
                notificationType: NotificationType.HardDelete,
                itemType: ItemType.LocationItem,
                locationItem: sensorType._id,
                deletedBy: deletedBy._id,
            });

            return { status: 200, message: 'locationItem deleted successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async restore(filter: FilterQuery<SensorType>): Promise<{ status: number; message: string }> {
        try {
            const locationItem = await this.LocationItem.find(filter);

            if (locationItem.length === 0) {
                return { status: 404, message: 'No locationItem found for the provided IDs' };
            }

            const updateResult = await this.LocationItem.updateMany(filter, { $set: { isDeleted: false } });

            if (updateResult.matchedCount !== locationItem.length) {
                return { status: 500, message: 'Not all locationItems were updated' };
            }

            return { status: 200, message: 'locationItem restored successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }
}
