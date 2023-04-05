import { Email, Required, Default, ErrorMsg, Nullable  } from "@tsed/schema";
import { Model, ObjectID, Select, Unique } from "@tsed/mongoose";

@Model()
export class Observation {
  @Select(true)
  @ObjectID("_id")
  _id: string;

  @Select(true)
  @Nullable(false)
  userId: string;

  @Select(true)
  @Nullable(false)
  startDate: Date;

  @Select(true)
  @Nullable(false)
  endDate: Date;

  @Select(true)
  fileUrl: string;

}

