import { Email, Required, Default, ErrorMsg, Nullable, Enum } from '@tsed/schema';
import { Model, ObjectID, Ref, Select, Unique } from '@tsed/mongoose';
import { SensorTypeEnum } from './Enum';
import { User } from './User';

@Model()
export class SensorType {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Select(true)
    @Unique(false)
    type: string;

    @Select(true)
    @Nullable(false)
    properties: string[];

    @Select(true)
    @Nullable(true)
    manufacturer: string;

    @Select(true)
    @Default(false)
    isDefault: boolean;

    @Select(true)
    @Ref(() => User)
    createdBy: Ref<User> | null;

    @Select(false)
    @Default(false)
    isDeleted: boolean;

    @Select(false)
    @Nullable(true)
    deletedAt: Date;
}
