import { Email, Required, Default, ErrorMsg, Nullable } from '@tsed/schema';
import { Model, ObjectID, Select, Unique } from '@tsed/mongoose';
import { Role } from './Enum';

@Model()
export class User {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Required().Error('license is Required')
    @Unique()
    license: string;

    @Required().Error('First Name is Required')
    firstName: string;

    @Required().Error('Last Name is Required')
    lastName: string;

    @Required().Error('Email is Required')
    @Email()
    @Unique()
    email: string;

    @Default(Role.User)
    role: string;

    @Required().Error('Password is Required')
    @Select(false)
    password: string;

    @Nullable(String)
    @Select(true)
    address: string;

    @Nullable(String)
    @Select(true)
    profileImage: string;

    @Default(Date.now)
    createdAt: Date = new Date();

    @Nullable(String)
    @Default('')
    @Select(false)
    emailOTP: string;
}
