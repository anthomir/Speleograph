import {CollectionOf, Email, Required, Default,Minimum,Maximum} from "@tsed/schema";
import {Model, ObjectID, Ref} from "@tsed/mongoose";
import { User } from "./User";
import { Sensor } from "./Sensor";

@Model()
export class CaveMetadata {
  @ObjectID("id")
  _id: string;

  @Required()
  @Ref(() => User)
  userId: Ref<User>;

  @Required()
  caveId: string;

  @Required()
  caveName: string;

  @Required()
  filePath: string;

  @Required()
  @Ref(() => Sensor)
  sensorId: Ref<Sensor>;
}