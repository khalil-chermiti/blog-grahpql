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
    createUser(userData : CreateUserInput) : User!
    createPost(postData : CreatePostInput) : Post!
    createComment(commentData : CreateCommentInput) : Comment!

    deleteUser(id : ID!) : User!
    deletePost(id : ID!) : Post!
    deleteComment(id : ID!) : Comment!
  }

  input CreateUserInput {
    name : String!
    email : String!
    age : Int
  }

  input CreatePostInput {
    title : String!
    author : String!
    content : String!
    published : Boolean!
  }

  input CreateCommentInput {
    content : String!
    userId : String!
    postId : String! 
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

type userInput = {
  userData: {
    name: string;
    email: string;
    age: number;
  };
};

type postInput = {
  postData: {
    title: string;
    author: string;
    content: string;
    published: boolean;
  };
};

type commentInput = {
  commentData: {
    userId: string;
    postId: string;
    content: string;
  };
};

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
    createUser: (_: unknown, args: userInput): User => {
      const isEmailTaken = users.some(
        user => user.email === args.userData.email
      );
      if (isEmailTaken) throw new Error("email is taken");

      const user: User = {
        id: randomUUID(),
        name: args.userData.name,
        email: args.userData.email,
        age: args.userData.age,
      };

      users.push(user);

      return user;
    },

    createPost: (_: unknown, args: postInput): Post => {
      const foundAuthor = users.find(
        user => user.name === args.postData.author
      );

      if (!foundAuthor) throw new Error("author does not exist");

      const post: Post = {
        id: randomUUID(),
        title: args.postData.title,
        content: args.postData.content,
        author: foundAuthor.id,
        published: args.postData.published,
      };

      posts.push(post);

      return post;
    },

    createComment: (_: unknown, args: commentInput): Comment => {
      // find user
      const foundAuthor = users.some(
        user => user.id === args.commentData.userId
      );
      if (!foundAuthor) throw new Error("userId not found");

      // find post
      const foundPost = posts.some(post => post.id === args.commentData.postId);
      if (!foundPost) throw new Error("postId not found");

      // if exit add Comment

      const comment: Comment = {
        id: randomUUID(),
        userId: args.commentData.userId,
        postId: args.commentData.postId,
        content: args.commentData.content,
      };

      comments.push(comment);

      return comment;
    },

    deleteUser: (_: unknown , args : {id : 'string'}) : User => {
      const userIndex = users.findIndex(user => user.id === args.id) ;

      if (userIndex < 0) throw new Error('user not found');

      const deletedUser = users.splice(userIndex , 1);

      // delete comments and posts created by user
      posts = posts.filter(post => post.author != args.id);
      comments = comments.filter(comment => comment.userId != args.id);

      return deletedUser[0];
    },

    deletePost: (_: unknown , args : {id : 'string'}) : Post => {
      const postIndex = posts.findIndex(post => post.id === args.id);

      if (postIndex < 0 ) throw new Error("post not found");

      const post = posts.splice(postIndex , 1)
      comments = comments.filter(comment => comment.postId != args.id);

      return post[0];
    } ,

    deleteComment : (_: unknown , args : {id : 'string'}) : Comment => {
      const commentIndex = comments.findIndex(comment => comment.id === args.id);

      if (commentIndex < 0) throw new Error("comment not found");

      const comment = comments.splice(commentIndex, 1);
      comments = comments.filter(comment => comment.id != args.id );

      return comment[0];
    }
  },
};

const server = createServer({
  schema: {
    typeDefs: typeDefs,
    resolvers: resolvers,
  },
});
server.start();
