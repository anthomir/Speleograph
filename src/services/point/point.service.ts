import { Inject, Service } from '@tsed/di';
import { MongooseModel } from '@tsed/mongoose';
import { Area } from 'src/models/area';
import { Point } from 'src/models/point';

@Service()
export class PointService {
    @Inject(Point)
    private Area: MongooseModel<Point>;

    // JWT
    async find(filter: any, skip: string, take: string, sortBy: string): Promise<{ response: any; err: String | null }> {
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
            const response = await this.Area.create({
                pointType: body.pointType,
                relatedToUndergroundCavity: body.relatedToUndergroundCavity,
            });

            return { response, err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error: ' + err };
        }
    }

    async delete(id: string): Promise<{ response: any; err: String | null }> {
        try {
            const data = await this.Area.deleteOne({ _id: id });

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
}
