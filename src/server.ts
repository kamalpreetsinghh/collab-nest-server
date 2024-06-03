import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./schema/resolvers.js";
import connectToDatabase from "./lib/dbConfig.js";

const startServer = async () => {
  dotenv.config();

  connectToDatabase();

  const app = express();

  // Middleware to parse JSON requests
  app.use(express.json());

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use("/graphql", expressMiddleware(server));
  const port = 4000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
  });
};

startServer();
