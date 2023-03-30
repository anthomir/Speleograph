import { Email, Required, Default, ErrorMsg, Nullable  } from "@tsed/schema";
import { Model, ObjectID, Select, Unique } from "@tsed/mongoose";

@Model()
export class Observation {
  @Select(true)
  @ObjectID("_id")
  _id: string;

  @Nullable(String)
  index: string;

  @Nullable(String)
  serialNo: string;

  @Nullable(String)
  number: string;

  @Nullable(String)
  year: string;

  @Nullable(String)
  month: string;

  @Nullable(String)
  day: string;

  @Nullable(String)
  minute: string;

  @Nullable(String)
  second: string;

  @Nullable(String)
  i: string;

  @Nullable(String)
  j: string;

  @Nullable(String)
  k: string;

  @Nullable(String)
  l: string;

  @Nullable(String)
  m: string;

}
