import { Email, Required, Default, ErrorMsg, Nullable } from '@tsed/schema';
import { Model, ObjectID, Select, Unique } from '@tsed/mongoose';
import { IsEmail, Matches } from 'class-validator';

export class RegistrationDto {
    @Required().Error('license is Required')
    @Unique()
    license: string;

    @Required().Error('First Name is Required')
    firstName: string;

    @Required().Error('Last Name is Required')
    lastName: string;

    @Required().Error('Email is Required')
    @IsEmail({}, { message: 'email must use a correct format' })
    @Unique()
    email: string;

    @Required().Error('Password is Required')
    @Select(false)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-zA-Z]).{8,}$/, {
        message:
            'Password too weak. It must contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character.',
    })
    password: string;

    @Nullable(String)
    @Select(true)
    address: string;

    @Nullable(String)
    @Select(true)
    profileImage: string;
}
