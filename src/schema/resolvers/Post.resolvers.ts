import { randomUUID } from "crypto";
import {
  User,
  Comment,
  Database,
  Post,
  PostInput,
  UpdatePostInput,
} from "../../types";

export default {
  Query: {
    getPosts: (
      parent: unknown,
      args: { commentId: String },
      context: { db: Database }
    ): Post[] => {
      return context.db.posts;
    },

    getPost: (
      parent: unknown,
      args: { postId: string },
      context: { db: Database }
    ): Post | [] => {
      const { db } = context;

      const post = db.posts.find(post => post?.id === args.postId);
      return post ? post : [];
    },
  },

  Mutation: {
    createPost: (
      parent: unknown,
      args: PostInput,
      context: { db: Database }
    ): Post => {
      const { db } = context;

      const foundAuthor = db.users.find(
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

      db.posts.push(post);

      return post;
    },

    deletePost: (
      parent: unknown,
      args: { id: "string" },
      context: { db: Database }
    ): Post => {
      const { db } = context;

      const postIndex = db.posts.findIndex(post => post.id === args.id);

      if (postIndex < 0) throw new Error("post not found");

      const post = db.posts.splice(postIndex, 1);
      db.comments = db.comments.filter(comment => comment.postId != args.id);

      return post[0];
    },

    updatePost: (
      parent: unknown,
      args: UpdatePostInput,
      context: { db: Database }
    ): Post => {
      const { db } = context;
      const post = db.posts.find(post => post.id === args.id);

      if (!post) throw new Error("post not found");

      if (typeof args.data.title === "string") {
        post.title = args.data.title;
      }

      if (typeof args.data.content === "string") {
        post.title = args.data.content;
      }

      if (typeof args.data.published === "boolean") {
        post.published = args.data.published;
      }

      return post;
    },
  },

  Post: {
    author: (
      parent: { author: string },
      args: {},
      context: { db: Database }
    ): User | undefined => {
      const { db } = context;

      return db.users.find(user => user.id === parent.author);
    },

    comments: (
      parent: { id: String },
      args: {},
      context: { db: Database }
    ): Comment[] => {
      const { db } = context;

      const commentsArray: Comment[] = [];
      db.comments.forEach(comment => {
        if (comment.postId === parent.id) commentsArray.push(comment);
      });

      return commentsArray;
    },
  },
};
