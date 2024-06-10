import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string | null;
  description: string | null;
  image: string | null;
  githubUrl: string | null;
  linkedInUrl: string | null;
  websiteUrl: string | null;
  projects: mongoose.Types.ObjectId[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  forgotPasswordToken: String | null;
  forgotPasswordTokenExpiry: String | null;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, default: null },
  description: { type: String, default: null },
  image: { type: String, default: null },
  githubUrl: { type: String, default: null },
  linkedInUrl: { type: String, default: null },
  websiteUrl: { type: String, default: null },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  forgotPasswordToken: { type: String, default: null },
  forgotPasswordTokenExpiry: { type: String, default: null },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model("User", UserSchema);
