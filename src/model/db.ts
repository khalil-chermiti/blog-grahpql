import {Post , User , Comment} from '../types';

let users: User[] = [
  {
    id: "1",
    name: "khalil",
    email: "khalil@gmail.com",
    age: 20,
    posts: ["1"],
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
];

let comments: Comment[] = [
  {
    id: "1",
    postId: "1",
    userId: "1",
    content: "like graphql",
  },
];

const db = {
  posts ,
  users , 
  comments ,
}

export default {db : db} ;