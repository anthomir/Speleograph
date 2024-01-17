import { LocationItem } from './locationItem';
import { Required, Default, Nullable } from '@tsed/schema';
import { Model, ObjectID, Ref, Select } from '@tsed/mongoose';
import { NotificationType, ItemType } from './Enum';
import { CaveObservation } from './CaveObservation';
import { Sensor } from './Sensor';
import { SensorType } from './SensorType';
import { User } from './User';
import { LocationObservation } from './locationObservation';

@Model()
export class Notification {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Required()
    title: string;

    @Required()
    notificationType: NotificationType;

    @Required()
    itemType: ItemType;

    @Nullable(true)
    @Ref(() => CaveObservation)
    caveObservation: CaveObservation;

    @Nullable(true)
    @Ref(() => SensorType)
    sensorType: SensorType;

    @Nullable(true)
    @Ref(() => LocationObservation)
    locationObservation: LocationObservation;

    @Nullable(true)
    @Ref(() => LocationItem)
    locationItem: LocationItem;

    @Nullable(true)
    @Ref(() => Sensor)
    sensor: Sensor;

    @Default(false)
    isRead: boolean;

    @Default(new Date())
    createdAt: Date;

    @Select(true)
    @Ref(() => User)
    deletedBy: Ref<User> | null;
}
