import Joi from '@hapi/joi';

export const SensorTypeCreationSchema = Joi.object({
    properties: Joi.array().required(),
    type: Joi.string().required(),
    manufacturer: Joi.string().required(),
});
