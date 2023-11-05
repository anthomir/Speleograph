import { Required } from '@tsed/schema';
import { Model, ObjectID, Ref, Select } from '@tsed/mongoose';
import { User } from './User';
import { SensorType } from './SensorType';

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
    filePath: string;

    @Required(true)
    timeZone: string;

    @Required(false)
    @Ref(() => SensorType)
    sensorId: Ref<SensorType>;

    @Required()
    @Ref(() => User)
    createdBy: Ref<User>;
}
