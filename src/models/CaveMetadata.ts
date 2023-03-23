import {CollectionOf, Email, Required, Default,Minimum,Maximum} from "@tsed/schema";
import {Model, ObjectID, Ref} from "@tsed/mongoose";
import { User } from "./User";

@Model()
export class CaveMetadata {
  @ObjectID("id")
  _id: string;

  @Required()
  @Ref(() => User)
  authorId: Ref<User>;

  @Required()
  caveName: string;
}