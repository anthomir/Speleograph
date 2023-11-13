import { Email, Required, Default, ErrorMsg, Nullable } from '@tsed/schema';
import { Model, ObjectID, Select, Unique } from '@tsed/mongoose';
import { Role } from './Enum';

@Model()
export class Person {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Required().Error('First Name is Required')
    firstname: string;

    @Required().Error('Last Name is Required')
    lastname: string;

    @Nullable(String)
    nick: string;

    @Select(false)
    @Default(false)
    isDeleted: boolean;
}
