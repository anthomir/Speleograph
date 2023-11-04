import { Nullable } from '@tsed/schema';
import { Model, ObjectID, Select } from '@tsed/mongoose';

@Model()
export class Organization {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Nullable(String)
    mbox: string;

    @Nullable(String)
    homepage: string;

    @Nullable(String)
    streetAddress: string;

    @Nullable(String)
    postalCode: string;

    @Nullable(String)
    addressLocality: string;

    @Nullable(String)
    addressCountry: string;
}
