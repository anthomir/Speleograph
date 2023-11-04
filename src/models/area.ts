import { Email, Required, Default, ErrorMsg, Nullable } from '@tsed/schema';
import { Model, ObjectID, Select, Unique } from '@tsed/mongoose';
import { Role } from './Enum';

@Model()
export class Area {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Nullable(String)
    areaType: string;

    @Nullable(String)
    polygon: string;
}
