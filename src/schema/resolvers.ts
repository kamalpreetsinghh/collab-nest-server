import mongoose from "mongoose";
import { Project, IProject } from "../models/Project";
import { User, IUser } from "../models/User";
import { CreateUserInput } from "../types/types";

export const resolvers = {
  Query: {
    users: async (): Promise<IUser[]> =>
      await User.find({}).populate("projects"),
    user: async (_: any, { id }: { id: string }): Promise<IUser | null> =>
      await User.findById(id)
        .populate("projects")
        .populate("followers")
        .populate("following"),
    userByEmail: async (
      _: any,
      { email }: { email: string }
    ): Promise<IUser | null> =>
      await User.findOne({ email }).populate("projects"),
    userByPasswordToken: async (
      _: any,
      { forgotPasswordToken }: { forgotPasswordToken: string }
    ): Promise<IUser | null> =>
      await User.findOne({ forgotPasswordToken }).populate("projects"),
    usernamesByName: async (
      _: any,
      { name }: { name: string }
    ): Promise<string[]> => {
      const users = await User.find({ name });
      return users.map((user) => user.username);
    },
    followers: async (_: any, { userId }: { userId: string }) => {
      const user = await User.findById(userId).populate("followers");
      return user ? user.followers : [];
    },
    following: async (_: any, { userId }: { userId: string }) => {
      const user = await User.findById(userId).populate("following");
      return user ? user.following : [];
    },
    projects: async (
      _: any,
      {
        page = 1,
        limit = 8,
        category,
      }: { page?: number; limit?: number; category: string }
    ): Promise<{
      projects: IProject[];
      totalProjects: number;
      totalPages: number;
      currentPage: number;
    }> => {
      const query = category !== "Discover" ? { category } : {};
      const skip = (page - 1) * limit;
      const projects = await Project.find(query)
        .skip(skip)
        .limit(limit)
        .populate("createdBy");
      const totalProjects = await Project.countDocuments(query);
      const totalPages = Math.ceil(totalProjects / limit) || 1;

      return { projects, totalProjects, totalPages, currentPage: page };
    },
    project: async (_: any, { id }: { id: string }): Promise<IProject | null> =>
      await Project.findById(id).populate("createdBy"),
    getUserProjects: async (
      _: any,
      { id, limit = 8 }: { id: string; limit?: number }
    ): Promise<IProject[]> => {
      const projects = await Project.find({ createdBy: id })
        .limit(limit)
        .populate("createdBy");
      return projects;
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      { input }: { input: CreateUserInput }
    ): Promise<IUser> => {
      const newUser = new User(input);

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
    followUser: async (
      _: any,
      { userId, followId }: { userId: string; followId: string }
    ) => {
      const user = await User.findById(userId);
      const followUser = await User.findById(followId);
      if (user && followUser) {
        if (!user.following.includes(new mongoose.Types.ObjectId(followId))) {
          user.following.push(new mongoose.Types.ObjectId(followId));
          followUser.followers.push(new mongoose.Types.ObjectId(userId));
          await user.save();
          await followUser.save();
        }
      }
      return user;
    },
    unfollowUser: async (
      _: any,
      { userId, unfollowId }: { userId: string; unfollowId: string }
    ) => {
      const user = await User.findById(userId);
      const unfollowUser = await User.findById(unfollowId);
      if (user && unfollowUser) {
        user.following = user.following.filter(
          (id) => id.toString() !== unfollowId
        );
        unfollowUser.followers = unfollowUser.followers.filter(
          (id) => id.toString() !== userId
        );
        await user.save();
        await unfollowUser.save();
      }
      return user;
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
