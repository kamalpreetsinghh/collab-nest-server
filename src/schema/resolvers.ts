import mongoose from "mongoose";
import { Project, IProject } from "../models/Project.js";
import { User, IUser } from "../models/User.js";

export const resolvers = {
  Query: {
    users: async (): Promise<IUser[]> =>
      await User.find({}).populate("projects"),
    user: async (_: any, { id }: { id: string }): Promise<IUser | null> =>
      await User.findById(id).populate("projects"),
    userByEmail: async (
      _: any,
      { email }: { email: string }
    ): Promise<IUser | null> =>
      await User.findOne({ email }).populate("projects"),
    usernamesByName: async (
      _: any,
      { name }: { name: string }
    ): Promise<string[]> => {
      const users = await User.find({ name });
      return users.map((user) => user.username);
    },
    projects: async (): Promise<IProject[]> =>
      await Project.find({}).populate("createdBy"),
    project: async (_: any, { id }: { id: string }): Promise<IProject | null> =>
      await Project.findById(id).populate("createdBy"),
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: IUser }): Promise<IUser> => {
      const {
        name,
        username,
        email,
        description,
        image,
        githubUrl,
        linkedInUrl,
        websiteUrl,
      } = input;

      const newUser = new User({
        name,
        username,
        email,
        description,
        image,
        githubUrl,
        linkedInUrl,
        websiteUrl,
      });
      await newUser.save();
      return newUser;
    },
    updateUser: async (
      _: any,
      { id, input }: { id: string; input: Partial<IUser> }
    ): Promise<IUser | null> => {
      const updatedUser = await User.findByIdAndUpdate(id, input, {
        new: true,
      }).populate("projects");
      if (!updatedUser) {
        throw new Error("User not found");
      }
      return updatedUser;
    },
    createProject: async (
      _: any,
      { input }: { input: IProject }
    ): Promise<IProject> => {
      const {
        title,
        description,
        image,
        liveSiteUrl,
        githubUrl,
        category,
        createdBy,
      } = input;
      const user = await User.findById(createdBy);
      if (!user) {
        throw new Error("User not found");
      }
      const newProject = new Project({
        title,
        description,
        image,
        liveSiteUrl,
        githubUrl,
        category,
        createdBy: user._id,
      });
      await newProject.save();
      user.projects.push(newProject._id as mongoose.Types.ObjectId);
      await user.save();
      return newProject;
    },
  },
  User: {
    projects: async (user: IUser): Promise<IProject[]> =>
      await Project.find({ createdBy: user._id }),
  },
  Project: {
    createdBy: async (project: IProject): Promise<IUser | null> =>
      await User.findById(project.createdBy),
  },
};
