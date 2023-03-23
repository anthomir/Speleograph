import { Email, Required, Default, ErrorMsg } from "@tsed/schema";
import { Model, ObjectID, Select, Unique } from "@tsed/mongoose";
import { Role } from "./Enum";

@Model()
export class User {
  @Select(true)
  @ObjectID("_id")
  _id: string;

  @Required()
  name: string;

  @Required().Error("Email Should be unique")
  @Email()
  @Unique()
  email: string;

  @Default(Role.User)
  role: string;

  @Required()
  @Select(false)
  password: string;
}
