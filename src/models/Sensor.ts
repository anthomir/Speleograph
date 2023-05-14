import { Email, Required, Default, ErrorMsg, Nullable, Enum  } from "@tsed/schema";
import { Model, ObjectID, Ref, Select, Unique } from "@tsed/mongoose";
import { SensorType } from "./Enum";
import { User } from "./User";

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

  @Select(true)
  @Default(false)
  isDefault: boolean

  @Select(true)
  @Required()
  @Ref(() => User)
  createdBy: Ref<User>;
}

