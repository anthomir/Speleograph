import {CollectionOf, Email, Required, Default,Minimum,Maximum} from "@tsed/schema";
import {Model, ObjectID, Ref, Select} from "@tsed/mongoose";
import { User } from "./User";
import { SensorType } from "./SensorType";
import { Sensor } from "./Sensor";

@Model()
export class CaveMetadata {
  @ObjectID("id")
  _id: string;

  @Required()
  @Ref(() => User)
  userId: Ref<User>;

  @Required(true)
  caveId: string;

  @Select(true)
  beginDate: Date;

  @Select(true)
  endDate: Date;

  @Required(true)
  filePath: string;

  @Required(false)
  @Ref(() => Sensor)
  sensorId: Ref<Sensor>;
}