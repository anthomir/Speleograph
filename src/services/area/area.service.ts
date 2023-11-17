import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { Area } from '../../models/area';
import { UpdateAreaDto } from '../../dto/area/updateArea';

@Service()
export class AreaService {
    @Inject(Area)
    private Area: MongooseModel<Area>;

    // JWT
    async findById(id: string): Promise<{ status: number; data: Area | null; message: string | null }> {
        try {
            const area = await this.Area.findById(id);

            if (!area) {
                return { status: 404, data: null, message: 'Area not found' };
            }

            return { status: 200, data: area, message: 'Area found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async find(filter: any, skip: string, take: string, sortBy: string): Promise<{ status: number; data: Area[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.Area.find(JSON.parse(filter))
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.Area.find()
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined);

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No Area found' };
            }

            return { status: 200, data, message: 'Areas found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: Area | null; message: string }> {
        try {
            const newArea = await this.Area.create({
                areaType: body.areaType,
                polygon: body.polygon,
            });

            if (newArea) {
                return { status: 201, data: newArea, message: 'Area created successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to create the area' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async deleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            const result = await this.Area.deleteOne({ _id: id });

            if (result.deletedCount === 1) {
                return { status: 200, message: 'Area deleted successfully' };
            } else {
                return { status: 404, message: 'Area not found' };
            }
        } catch (error) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async updateArea(id: string, newData: UpdateAreaDto): Promise<{ status: number; data: Area | null; message: string }> {
        try {
            const area = await this.Area.findById(id);

            if (!area) {
                return { status: 404, data: null, message: 'Area not found' };
            }

            const updateData: Partial<Area> = {};

            for (const field in newData) {
                if (field in area) {
                    const key = field as keyof UpdateAreaDto;
                    updateData[key] = newData[key];
                }
            }

            const updatedArea = await this.Area.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            if (updatedArea) {
                return { status: 200, data: updatedArea, message: 'Area updated successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to update the area' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }
}
