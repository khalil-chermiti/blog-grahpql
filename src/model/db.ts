import { Post, User, Comment } from "../types";

let users: User[] = [
  {
    id: "1",
    name: "khalil",
    email: "khalil@gmail.com",
    age: 20,
    posts: ["1"],
  },
  {
    id: "2",
    name: "wissem",
    email: "wissem@gmail.com",
    age: 20,
    posts: ["2"],
  },
];

let posts: Post[] = [
  {
    id: "1",
    title: "graphql",
    content: "graphql is awesome",
    author: "1",
    published: true,
  },
  {
    id: "2",
    title: "nodejs",
    content: "nodejs is awesome",
    author: "2",
    published: true,
  },
];

let comments: Comment[] = [
  {
    id: "1",
    postId: "1",
    userId: "1",
    content: "like graphql",
  },
  {
    id: "2",
    postId: "2",
    userId: "2",
    content: "like nodejs",
  },
];

const db = {
  posts,
  users,
  comments,
};

export default db;
