import { Default, Nullable, Optional, Required } from '@tsed/schema';
import { Model, ObjectID, Ref, Select } from '@tsed/mongoose';
import { User } from './User';

@Model()
export class LocationItem {
    @ObjectID('id')
    _id: string;

    @Required(true)
    name: string;

    @Required(true)
    lng: string;

    @Required(true)
    lat: string;

    @Required()
    @Ref(() => User)
    createdBy: Ref<User>;

    @Required()
    @Default(Date.now)
    createdAt: Date;

    @Select(true)
    @Default(false)
    isDeleted: boolean;

    @Select(false)
    @Nullable(true)
    deletedAt: Date;
}
