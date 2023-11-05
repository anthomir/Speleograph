import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { UpdateSensorDto } from '../../dto/sensor/updateSensor';
import { Point } from '../../models/point';
import { UpdatePointDto } from '../../dto/point/updatePoint';

@Service()
export class PointService {
    @Inject(Point)
    private Point: MongooseModel<Point>;

    // JWT
    async findById(id: string): Promise<{ status: number; data: Point | null; message: string | null }> {
        try {
            const sensor = await this.Point.findById(id);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            return { status: 200, data: sensor, message: 'Sensor found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async find(filter: any, skip: string, take: string, sortBy: string): Promise<{ status: number; data: Point[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.Point.find(JSON.parse(filter))
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.Point.find()
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
    async post(body: any): Promise<{ status: number; data: Point | null; message: string }> {
        try {
            const newSensor = await this.Point.create({
                name: body.name,
                serialNo: body.serialNo,
                sensorTypeId: body.sensorTypeId,
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

    async deleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            // Find the sensor by its _id and delete it
            const result = await this.Point.deleteOne({ _id: id });

            if (result.deletedCount === 1) {
                return { status: 200, message: 'Sensor deleted successfully' };
            } else {
                return { status: 404, message: 'Sensor not found' };
            }
        } catch (error) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async updatePoint(id: string, newData: UpdatePointDto): Promise<{ status: number; data: Point | null; message: string }> {
        try {
            const sensor = await this.Point.findById(id);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            const updateData: Partial<Point> = {};

            for (const field in newData) {
                if (field in sensor) {
                    const key = field as keyof UpdatePointDto;
                    updateData[key] = newData[key];
                }
            }

            const updatedSensor = await this.Point.findByIdAndUpdate(id, updateData, {
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
}
