import { Email, Required, Default, ErrorMsg, Nullable, Enum  } from "@tsed/schema";
import { Model, ObjectID, Select, Unique } from "@tsed/mongoose";
import { SensorType } from "./Enum";

@Model()
export class Sensor {
  @Select(true)
  @ObjectID("_id")
  _id: string;

  @Select(true)
  name: string;

  @Select(true)
  @Nullable(false)
  properties: Array<string>;

}

