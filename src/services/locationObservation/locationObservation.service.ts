import { Inject, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import axios from 'axios';
import { CaveObservation } from '../../models/CaveObservation';
import fs from 'fs';
import { User } from '../../models/User';
import { ItemType, NotificationType, Role } from '../../models/Enum';
import { FilterQuery } from 'mongoose';
import { Notification } from '../../models/Notification';
import { LocationObservation } from 'src/models/locationObservation';

@Service()
export class LocationObservationService {
    @Inject(LocationObservation)
    private LocationObservation: MongooseModel<LocationObservation>;
    @Inject(Notification)
    private Notification: MongooseModel<Notification>;

    // JWT
    async findById(filter: FilterQuery<CaveObservation>): Promise<{ status: number; data: LocationObservation | null; message: string | null }> {
        try {
            const caveObservation = await this.LocationObservation.findOne(filter);

            if (!caveObservation) {
                return { status: 404, data: null, message: 'Observation not found' };
            }

            return { status: 200, data: caveObservation, message: 'Observation found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async find(
        filter: any,
        skip: string,
        take: string,
        sortBy: string,
    ): Promise<{ status: number; data: LocationObservation[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.LocationObservation.find(filter)
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                      .populate({
                          path: 'isObservedBy',
                          populate: {
                              path: 'sensorTypeId',
                          },
                      })
                : await this.LocationObservation.find()
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                      .populate({
                          path: 'isObservedBy',
                          populate: {
                              path: 'sensorTypeId',
                          },
                      });

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No Location Observation found' };
            }

            return { status: 200, data, message: 'Location Observation found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async create(user: User, res: Res, caveMetadata: any) {
        try {
            caveMetadata.createdBy = user._id;
            let cave = await this.LocationObservation.create({
                locationId: caveMetadata.locationId,
                beginDate: caveMetadata.beginDate,
                endDate: caveMetadata.endDate,
                fileName: caveMetadata.fileName == null || caveMetadata.fileName == undefined ? 'Unnamed' : caveMetadata.fileName,
                filePath: caveMetadata.filePath,
                timeZone: caveMetadata.timeZone,
                sensorId: caveMetadata.sensorId,
                isObservedBy: caveMetadata.sensorId,
                madeObservation: caveMetadata.sensorId,
                createdBy: user,
            });
            return res.status(200).json({ success: true, data: cave });
        } catch (err) {
            return res.status(400).json({ success: false, err: 'Bad Request' });
        }
    }

    async postFile(res: Res, file: any) {
        if (!file) return res.status(400).json({ success: false, err: 'File should be of type .CSV' });

        const filename = file.filename;
        const mimetype = file.mimetype.substring(file.mimetype.indexOf('/') + 1);

        fs.rename(`./public/uploads/${filename}`, `./public/uploads/${filename}.${mimetype}`, function (err) {
            if (err) return res.status(500).json({ success: false, err: '' });
        });
        return `${process.env.PRODUCTION_URL}/uploads/${filename}.${mimetype}`;
    }

    async update(caveId: string, fileName: any, res: Res) {
        try {
            const findCave = await this.LocationObservation.findById(caveId);
            if (!findCave) {
                return res.status(404).json({ message: 'Cave Observation not found' });
            }
            let cave = await this.LocationObservation.updateOne({ _id: caveId }, { fileName: fileName }, { new: true });

            if (!cave) {
                return res.status(404).json({ success: false, error: 'Document not found' });
            }

            return res.status(200).json({ success: true, data: cave });
        } catch (err) {
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    async deleteById(id: string, deletedBy: User): Promise<{ status: number; message: string }> {
        try {
            const observation = await this.LocationObservation.findOne({ _id: id, isDeleted: false });

            if (!observation) {
                return { status: 404, message: 'Observation not found' };
            }

            const data = await this.LocationObservation.updateOne({ _id: id }, { isDeleted: true, deletedAt: new Date() });
            if (data.modifiedCount != 1) {
                return { status: 500, message: 'Unable to delete Observation' };
            }

            await this.Notification.create({
                title: 'Delete notification',
                notificationType: NotificationType.SoftDelete,
                itemType: ItemType.LocationObservation,
                caveObservation: observation._id,
                deletedBy: deletedBy._id,
            });

            return { status: 200, message: 'Observation deleted successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async forceDeleteById(id: string, deletedBy: User): Promise<{ status: number; message: string }> {
        try {
            const observation = await this.LocationObservation.findOne({ _id: id });

            if (!observation) {
                return { status: 404, message: 'Observation not found' };
            }

            const data = await this.LocationObservation.deleteOne({ _id: id });

            if (data.deletedCount != 1) {
                return { status: 500, message: 'Internal server error' };
            }

            await this.Notification.create({
                title: 'Delete notification',
                notificationType: NotificationType.SoftDelete,
                itemType: ItemType.LocationObservation,
                locationObservation: observation._id,
                deletedBy: deletedBy._id,
            });

            return { status: 200, message: 'Observation deleted successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async restore(filter: FilterQuery<LocationObservation>): Promise<{ status: number; message: string }> {
        try {
            filter = { ...filter, ...{ isDeleted: true } };
            const observations = await this.LocationObservation.find(filter);

            if (observations.length === 0) {
                return { status: 404, message: 'No observations found for the provided IDs' };
            }

            const updateResult = await this.LocationObservation.updateMany(filter, { $set: { isDeleted: false, deletedAt: null } });

            if (updateResult.matchedCount !== observations.length) {
                return { status: 500, message: 'Not all observations were updated' };
            }

            return { status: 200, message: 'Observations restored successfully' };
        } catch (err) {
            return { status: 500, message: 'Internal server error' };
        }
    }
}
