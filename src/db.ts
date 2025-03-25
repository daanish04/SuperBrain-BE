import mongoose, { Schema, Types, model } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const ContentSchema = new Schema({
  link: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  tags: [{ type: Types.ObjectId, ref: "Tags" }],
  userId: { type: Types.ObjectId, ref: "User" },
});

const TagsSchema = new Schema({
  title: { type: String, required: true },
});

const LinkSchema = new Schema({
  link: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: "User" },
});

export const UserModel = model("User", UserSchema);
export const ContentModel = model("Content", ContentSchema);
export const TagsModel = model("Tags", TagsSchema);
export const LinkModel = model("Link", LinkSchema);
