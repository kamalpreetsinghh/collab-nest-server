export const typeDefs = `#graphql
    type User {
    id: ID!
    name: String!
    username: String!
    email: String!
    password: String
    image: String
    description: String
    githubUrl: String
    linkedInUrl: String
    websiteUrl: String
    forgotPasswordToken: String
    forgotPasswordTokenExpiry: String,
    following: [User!]
    followers: [User!]
    projects: [Project!]!
  }

  type Project {
    id: ID!
    title: String!
    description: String!
    image: String!
    liveSiteUrl: String!
    githubUrl: String!
    category: String!
    createdBy: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    userByEmail(email: String!): User
    usernamesByName(name: String!): [String!]!
    projects: [Project!]!
    project(id: ID!): Project
  }

  input CreateUserInput {
    name: String!
    username: String!
    email: String!
    description: String
    image: String
    githubUrl: String
    linkedInUrl: String
    websiteUrl: String
  }

  input UpdateUserInput {
    name: String
    username: String
    email: String
    description: String
    image: String
    githubUrl: String
    linkedInUrl: String
    websiteUrl: String
  }

  input CreateProjectInput {
    title: String!
    description: String!
    image: String!
    liveSiteUrl: String!
    githubUrl: String!
    category: String!
    createdBy: ID!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    createProject(input: CreateProjectInput!): Project!
  }
`;
