import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./User";

export interface IProject extends Document {
  title: string;
  description: string;
  image: string;
  websiteUrl: string;
  githubUrl: string;
  category: string;
  createdBy: IUser["_id"];
}

const ProjectSchema: Schema<IProject> = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  githubUrl: { type: String, required: true },
  category: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
