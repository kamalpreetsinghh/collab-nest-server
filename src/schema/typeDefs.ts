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
    websiteUrl: String!
    githubUrl: String!
    category: String!
    createdBy: User!
  }

  type ProjectPagination {
    projects: [Project!]!
    totalProjects: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    userByEmail(email: String!): User
    usernamesByName(name: String!): [String!]!
    userByPasswordToken(forgotPasswordToken: String!): User
    followers(userId: ID!): [User!]
    following(userId: ID!): [User!]
    projects(page: Int!, limit: Int!, category: String!): ProjectPagination!
    project(id: ID!): Project
    getUserProjects(id: ID!, limit: Int): [Project!]!
  }

  input CreateUserInput {
    name: String!
    username: String!
    email: String!
    password: String
    image: String
  }

  input UpdateUserInput {
    name: String
    username: String
    password: String
    description: String
    image: String
    githubUrl: String
    linkedInUrl: String
    websiteUrl: String
    forgotPasswordToken: String
    forgotPasswordTokenExpiry: String
  }

  input CreateProjectInput {
    title: String!
    description: String!
    image: String!
    websiteUrl: String!
    githubUrl: String!
    category: String!
    createdBy: ID!
  }

  input UpdateProjectInput {
    title: String
    description: String
    image: String
    websiteUrl: String
    githubUrl: String
    category: String
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    followUser(userId: ID!, followId: ID!): User
    unfollowUser(userId: ID!, unfollowId: ID!): User
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
  }
`;
