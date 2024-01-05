import { Inject, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { Notification } from '../../models/Notification';
import { FilterQuery } from 'mongoose';

@Service()
export class NotificationService {
    @Inject(Notification)
    private Notification: MongooseModel<Notification>;

    // JWT
    async findById(filter: any): Promise<{ status: number; data: Notification | null; message: string | null }> {
        try {
            const sensor = await this.Notification.findOne(filter);

            if (!sensor) {
                return { status: 404, data: null, message: 'Notification not found' };
            }
            return { status: 200, data: sensor, message: 'Notification found successfully' };
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
    ): Promise<{ status: number; data: Notification[] | null; message: string | null; count: number | null }> {
        try {
            const data = filter
                ? await this.Notification.find(filter)
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                      .populate('caveObservation')
                      .populate('sensor')
                      .populate('sensorType')
                      .populate('deletedBy')
                : await this.Notification.find()
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                      .populate('caveObservation')
                      .populate('sensor')
                      .populate('sensorType')
                      .populate('deletedBy');

            const count = await this.Notification.find({ isRead: false }).count();

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No notification found', count: null };
            }

            return { status: 200, data, message: 'Notifications found successfully', count };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error', count: null };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: Notification | null; message: string }> {
        try {
            const data = await this.Notification.create({
                title: body.title,
                description: body.description,
                createdAt: body.createdAt,
            });

            if (data) {
                return { status: 201, data: data, message: 'Notification created successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to create the notification' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async markNotificationsAsRead(filter: FilterQuery<Notification>): Promise<{ status: number; message: string }> {
        try {
            await this.Notification.updateMany(filter, { $set: { isRead: true } });

            return { status: 200, message: 'Notifications marked as read successfully' };
        } catch (error) {
            return { status: 500, message: 'Internal server error' };
        }
    }
}
