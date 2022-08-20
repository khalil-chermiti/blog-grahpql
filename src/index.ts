import { createServer } from "@graphql-yoga/node";

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
		posts : [Post]!
  }

	type Post {
		id : ID!
		title : String!
		content : String!
		author : User
		comments : [Comment]!
	}

	type Comment {
		id : String!
		userId : String!
		postId : String!
		content : String!
		user : User!
	}
`;

// ! typescript types
type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  posts: [string];
};

type Post = {
  id: string;
  author: String;
  title: string;
  content: string;
};

type Comment = {
  id: string;
  userId: string;
  postId: string;
  content?: string;
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

const getComments = () : Comment[] => comments; 
const getComment = (_ : unknown , args : {commentId : String}) : Comment | undefined => {
	return comments.find(comment => comment.id === args.commentId);
}

const resolvers = {
  Query: {
    getUser,
    getPosts,
    getPost,
		getComments,
		getComment
  },

  Post: {
    author(parent: { author: string }): User | undefined {
      return users.find(user => user.id === parent.author);
    },

    comments(parent: { id: String }): Comment[]{
      const commentsArray : Comment[] = [] ;
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
		user: (parent : {userId : string}) : User | undefined => {
			return users.find(user => user.id === parent.userId);
		} 
	}
};

const server = createServer({
  schema: {
    typeDefs: typeDefs,
    resolvers: resolvers,
  }
});
server.start();

