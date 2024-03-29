import { Default, Nullable, Required } from '@tsed/schema';
import { Model, ObjectID, Ref, Select } from '@tsed/mongoose';
import { User } from './User';
import { SensorType } from './SensorType';
import { CaveObservation } from './CaveObservation';

@Model()
export class Sensor {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Select(true)
    name: string;

    @Select(true)
    @Required(true)
    serialNo: string;

    @Select(true)
    @Required(false)
    @Nullable(true)
    observes: string[];

    @Select(true)
    @Required(true)
    @Ref(() => SensorType)
    sensorTypeId: Ref<SensorType>;

    @Select(true)
    @Required(true)
    @Ref(() => User)
    createdBy: Ref<User>;

    @Select(true)
    @Default(false)
    isDeleted: boolean;

    @Select(false)
    @Nullable(true)
    deletedAt: Date;
}
