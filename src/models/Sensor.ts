import { Email, Required, Default, ErrorMsg, Nullable, Enum  } from "@tsed/schema";
import { Model, ObjectID, Ref, Select, Unique } from "@tsed/mongoose";
import { User } from "./User";
import { SensorType } from "./SensorType";

@Model()
export class Sensor {
  @Select(true)
  @ObjectID("_id")
  _id: string;

  @Select(true)
  name: string;
  
  @Select(true)
  @Required(true)
  serialNo: string;

  @Select(true)
  @Required(true)
  @Ref(() => SensorType)
  sensorType: Ref<SensorType>

  @Select(true)
  @Required(true)
  @Ref(() => User)
  createdBy: Ref<User>;
}

