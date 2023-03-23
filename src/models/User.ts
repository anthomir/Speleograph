import { Email, Required, Default, ErrorMsg } from "@tsed/schema";
import { Model, ObjectID, Select, Unique } from "@tsed/mongoose";
import { Role } from "./Enum";

@Model()
export class User {
  @Select(true)
  @ObjectID("_id")
  _id: string;

  @Required().Error("Name is Required")
  name: string;

  @Required().Error("Email is Required")
  @Email()
  @Unique()
  email: string;

  @Default(Role.User)
  role: string;

  @Required().Error("Password is Required")
  @Select(false)
  password: string;
}