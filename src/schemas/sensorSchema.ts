import Joi from '@hapi/joi';

export const SensorCreationSchema = Joi.object({
    sensorTypeId: Joi.string().required(),
    name: Joi.string().required(),
    serialNo: Joi.string().required(),
});
