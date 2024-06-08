import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./schema/resolvers";
import connectDB from "./lib/dbConfig";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
  app.use("/graphql", expressMiddleware(server));
});

export default app;
