import { Email, Required, Default, ErrorMsg, Nullable } from '@tsed/schema';
import { Model, ObjectID, Select, Unique } from '@tsed/mongoose';
import { Role } from './Enum';

@Model()
export class BibliographicResource {
    @Select(true)
    @ObjectID('_id')
    _id: string;

    @Required()
    documentType: string;

    @Nullable(String)
    title: string;

    @Nullable(String)
    subject: string;

    @Nullable(String)
    language: string;

    @Nullable(String)
    publisher: string;

    @Nullable(String)
    creator: string;

    @Nullable(String)
    date: string;

    @Nullable(String)
    format: string;

    @Nullable(String)
    identifier: string;

    @Nullable(String)
    source: string;

    @Select(false)
    @Default(false)
    isDeleted: boolean;
}
