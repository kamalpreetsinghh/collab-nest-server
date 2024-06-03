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
    projects: async (
      _: any,
      { page = 1, limit = 8 }: { page?: number; limit?: number }
    ): Promise<{
      projects: IProject[];
      totalProjects: number;
      totalPages: number;
      currentPage: number;
    }> => {
      const totalProjects = await Project.countDocuments({});
      const totalPages = Math.ceil(totalProjects / limit) || 1;
      const projects = await Project.find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("createdBy");
      return { projects, totalProjects, totalPages, currentPage: page };
    },
    project: async (_: any, { id }: { id: string }): Promise<IProject | null> =>
      await Project.findById(id).populate("createdBy"),
    getUserProjects: async (
      _: any,
      {
        userId,
        page = 1,
        limit = 8,
      }: { userId: string; page?: number; limit?: number }
    ): Promise<{
      projects: IProject[];
      totalProjects: number;
      totalPages: number;
      currentPage: number;
    }> => {
      const totalProjects = await Project.countDocuments({ createdBy: userId });
      const totalPages = Math.ceil(totalProjects / limit) || 1;
      const projects = await Project.find({ createdBy: userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("createdBy");
      return { projects, totalProjects, totalPages, currentPage: page };
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: IUser }): Promise<IUser> => {
      const { name, username, email, image } = input;

      const newUser = new User({
        name,
        username,
        email,
        image,
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
        websiteUrl,
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
        websiteUrl,
        githubUrl,
        category,
        createdBy: user._id,
      });
      await newProject.save();
      user.projects.push(newProject._id as mongoose.Types.ObjectId);
      await user.save();
      return newProject;
    },
    updateProject: async (
      _: any,
      { id, input }: { id: string; input: Partial<IProject> }
    ): Promise<IProject | null> => {
      const updatedProject = await Project.findByIdAndUpdate(id, input, {
        new: true,
      }).populate("createdBy");
      if (!updatedProject) {
        throw new Error("Project not found");
      }
      return updatedProject;
    },
    deleteProject: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const project = await Project.findById(id);
        if (!project) {
          throw new Error("Project not found");
        }
        await Project.findByIdAndDelete(id);
        const user = await User.findById(project.createdBy);
        if (user) {
          await User.updateOne(
            { _id: user._id },
            { $pull: { projects: project._id } }
          );
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
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
