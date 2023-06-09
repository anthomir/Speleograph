import Joi from "@hapi/joi"

export const LoginSchema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
})