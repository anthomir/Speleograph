import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { Point } from '../../models/point';
import { UpdatePointDto } from '../../dto/point/updatePoint';

@Service()
export class PointService {
    @Inject(Point)
    private Point: MongooseModel<Point>;

    // JWT
    async findById(id: string): Promise<{ status: number; data: Point | null; message: string | null }> {
        try {
            const result = await this.Point.findById(id);

            if (!result) {
                return { status: 404, data: null, message: 'Point not found' };
            }

            return { status: 200, data: result, message: 'Point found successfully' };
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
                return { status: 404, data: null, message: 'No Points found' };
            }

            return { status: 200, data, message: 'Points found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: Point | null; message: string }> {
        try {
            const result = await this.Point.create({
                pointType: body.pointType,
                relatedToUndergroundCavity: body.relatedToUndergroundCavity,
            });

            if (result) {
                return { status: 201, data: result, message: 'Point created successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to create Point' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async updatePoint(id: string, newData: UpdatePointDto): Promise<{ status: number; data: Point | null; message: string }> {
        try {
            const point = await this.Point.findById(id);

            if (!point) {
                return { status: 404, data: null, message: 'Point not found' };
            }

            const updateData: Partial<Point> = {};

            for (const field in newData) {
                if (field in point) {
                    const key = field as keyof UpdatePointDto;
                    updateData[key] = newData[key];
                }
            }

            const updatedPoint = await this.Point.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            if (updatedPoint) {
                return { status: 200, data: updatedPoint, message: 'Point updated successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to update the Point' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async deleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            const result = await this.Point.deleteOne({ _id: id });

            if (result.deletedCount === 1) {
                return { status: 200, message: 'Point deleted successfully' };
            } else {
                return { status: 404, message: 'Point not found' };
            }
        } catch (error) {
            return { status: 500, message: 'Internal server error' };
        }
    }
}
