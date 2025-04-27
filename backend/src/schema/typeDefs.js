import { gql } from 'apollo-server';

export const typeDefs = gql`
  type User {
    id: ID!
    fullname: String!
    email: String!
    profile_pic: String
    token: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Message {
  id: ID!
  senderId: ID!
  receiverId: ID!
  text: String
  image: String
  createdAt: String!
  
}

  type Query {
  checkAuth: User
  fetchUsers: [User]
  getMessages(receiverId: ID!): [Message]
}

  type Mutation {
    signup(fullname: String!, email: String!, password: String!): User
    login(email: String!, password: String!): User
    logout: Boolean
    updateProfile(profile_pic: String): User
    sendMessage(receiverId: ID!, text: String, image: String): Message
  }


`;