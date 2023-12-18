import { ObjectSchema } from '@hapi/joi';
import { StoreSet } from '@tsed/core';
import { JoiValidationPipe } from './Joi.pipe';

export function UseJoiSchema(schema: ObjectSchema) {
    return StoreSet(JoiValidationPipe, schema);
}
export { JoiValidationPipe };
