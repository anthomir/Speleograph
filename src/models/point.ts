import { Default, Nullable } from '@tsed/schema';
import { Model, ObjectID, Select } from '@tsed/mongoose';

@Model()
export class Point {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Nullable(String)
    pointType: string;

    @Nullable(String)
    relatedToUndergroundCavity: string;

    @Select(false)
    @Default(false)
    isDeleted: boolean;
}
