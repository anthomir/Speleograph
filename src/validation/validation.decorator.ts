import {StoreSet} from "@tsed/core";
import {JoiValidationPipe} from "./Joi.pipe";

export function UseJoiValidation(schema: any) {
  return StoreSet(JoiValidationPipe, schema);
}