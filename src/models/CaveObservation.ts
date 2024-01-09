import { Default, Nullable, Optional, Required } from '@tsed/schema';
import { Model, ObjectID, Ref, Select } from '@tsed/mongoose';
import { User } from './User';
import { SensorType } from './SensorType';
import { Sensor } from './Sensor';

@Model()
export class CaveObservation {
    @ObjectID('id')
    _id: string;

    @Required(true)
    caveId: string;

    @Select(true)
    beginDate: Date;

    @Select(true)
    endDate: Date;

    @Required(true)
    fileName: string;

    @Required(true)
    filePath: string;

    @Required(true)
    timeZone: string;

    @Required(true)
    @Ref(() => SensorType)
    sensorTypeId: Ref<SensorType>;

    @Nullable(true)
    @Ref(() => Sensor)
    isObservedBy: Ref<Sensor>;

    @Required()
    @Ref(() => User)
    createdBy: Ref<User>;

    @Required()
    @Default(Date.now)
    createdAt: Date;

    @Select(false)
    @Default(false)
    isDeleted: boolean;

    @Select(false)
    @Nullable(true)
    deletedAt: Date;
}
