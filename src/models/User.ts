import { Email, Required, Default } from "@tsed/schema";
import { Model, ObjectID, Select, Unique } from "@tsed/mongoose";
import { Role } from "./Enum";

@Model()
export class User {
  @ObjectID("_id")
  _id: string;

  @Required()
  name: string;

  @Required()
  @Email()
  @Unique()
  email: string;

  @Default(Role.User)
  role: string;

  @Required()
  @Select(false)
  password: string;
}
