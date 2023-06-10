import {CollectionOf, Email, Required, Default,Minimum,Maximum} from "@tsed/schema";
import {Model, ObjectID, Ref, Select} from "@tsed/mongoose";
import { User } from "./User";
import { SensorType } from "./SensorType";
import { Sensor } from "./Sensor";

@Model()
export class CaveObservation {
  @ObjectID("id")
  _id: string;

  @Required(true)
  caveId: string;

  @Select(true)
  beginDate: Date;

  @Select(true)
  endDate: Date;

  @Required(true)
  filePath: string;

  @Required(true)
  timeZone: string;

  @Required(false)
  @Ref(() => Sensor)
  sensorId: Ref<Sensor>;

  @Required()
  @Ref(() => User)
  createdBy: Ref<User>;
}