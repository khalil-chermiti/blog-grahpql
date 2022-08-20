import { createServer } from "@graphql-yoga/node";
import { randomUUID } from "crypto";

// ! defining types
const typeDefs = `
	type Query {
		getComment(commentId : String!) : Comment 
		getComments : [Comment]!

		getPost(postId : String!): Post!
		getUser(id : String!): User!

		getPosts : [Post]!
	}

  type User {
	  id : ID!
	  name: String!
	  email: String!
	  age: Int!
		posts : [Post]
  }

	type Post {
		id : ID!
		title : String!
		content : String!
		author : User!
    published : Boolean!
		comments : [Comment]!
	}

	type Comment {
		id : String!
		userId : String!
		postId : String!
		content : String!
		user : User!
	}

  type Mutation {
    createUser(name : String! , email : String! , age : Int) : User!
    createPost(title : String! , content : String! , author : String! , published : Boolean!) : Post!
    createComment(content : String! , userId : String! , postId : String! ) : Comment!
  }
`;
randomUUID;
// ! typescript types
type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  posts?: [string];
};

type Post = {
  id: string;
  author: String;
  title: string;
  content: string;
  published: boolean;
};

type Comment = {
  id: string;
  userId: string;
  postId: string;
  content: string;
};

const users: User[] = [
  {
    id: "1",
    name: "khalil",
    email: "khalil@gmail.com",
    age: 20,
    posts: ["1"],
  },
];

const posts: Post[] = [
  {
    id: "1",
    title: "graphql",
    content: "graphql is awesome",
    author: "1",
    published: true,
  },
];

const comments: Comment[] = [
  {
    id: "1",
    postId: "1",
    userId: "1",
    content: "like graphql",
  },
];

// ! get user resolver
const getUser = (_: unknown, args: { id: string }): User | undefined =>
  users.find(user => user.id === args.id);

const getPosts = (): Post[] => posts;

const getPost = (_: unknown, args: { postId: string }): Post | [] => {
  const post = posts.find(post => post?.id === args.postId);
  return post ? post : [];
};

const getComments = (): Comment[] => comments;
const getComment = (
  _: unknown,
  args: { commentId: String }
): Comment | undefined => {
  return comments.find(comment => comment.id === args.commentId);
};

const resolvers = {
  Query: {
    getUser,
    getPosts,
    getPost,
    getComments,
    getComment,
  },

  Post: {
    author(parent: { author: string }): User | undefined {
      return users.find(user => user.id === parent.author);
    },

    comments(parent: { id: String }): Comment[] {
      const commentsArray: Comment[] = [];
      comments.forEach(comment => {
        if (comment.postId === parent.id) commentsArray.push(comment);
      });

      return commentsArray;
    },
  },

  User: {
    posts: (parent: { id: string }): Post[] => {
      let postsArray: Post[] = [];

      posts.forEach(post => {
        if (post?.author === parent.id) postsArray.push(post);
      });

      return postsArray;
    },
  },

  Comment: {
    user: (parent: { userId: string }): User | undefined => {
      return users.find(user => user.id === parent.userId);
    },
  },

  Mutation: {
    createUser: (
      _: unknown,
      args: { name: string; email: string; age: number }
    ): User => {
      const isEmailTaken = users.some(user => user.email === args.email);
      if (isEmailTaken) throw new Error("email is taken");

      const user: User = {
        id: randomUUID(),
        name: args.name,
        email: args.email,
        age: args.age,
      };

      console.log(user);

      users.push(user);

      return user;
    },

    createPost: (
      _: unknown,
      args: {
        title: string;
        author: string;
        content: string;
        published: boolean;
      }
    ): Post => {
      const foundAuthor = users.find(user => user.name === args.author);

      if (!foundAuthor) throw new Error("author does not exist");

      const post: Post = {
        id: randomUUID(),
        title: args.title,
        content: args.content,
        author: foundAuthor.id,
        published: args.published,
      };

      posts.push(post);

      return post;
    },

    createComment: (
      _: unknown,
      args: { userId: string; postId: string; content: string }
    ): Comment => {
      // find user
      const foundAuthor = users.some(user => user.id === args.userId);
      if (!foundAuthor) throw new Error("userId not found");

      // find post
      const foundPost = posts.some(post => post.id === args.postId);
      if (!foundPost) throw new Error("postId not found");

      // if exit add Comment

      const comment: Comment = {
        id: randomUUID(),
        userId: args.userId,
        postId: args.postId,
        content: args.content,
      };

      comments.push(comment);

      return comment;
    },
  },
};

const server = createServer({
  schema: {
    typeDefs: typeDefs,
    resolvers: resolvers,
  },
});
server.start();
