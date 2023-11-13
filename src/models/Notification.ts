import { Required, Default } from '@tsed/schema';
import { Model, ObjectID, Select } from '@tsed/mongoose';

@Model()
export class Notification {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Required()
    title: string;

    @Required()
    description: string;

    @Default(false)
    isRead: boolean;

    @Default(new Date())
    createdAt: Date;
}
