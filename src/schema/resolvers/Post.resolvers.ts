import { randomUUID } from "crypto";
import { PubSub, Repeater } from "@graphql-yoga/node";
import {
  User,
  Comment,
  Database,
  Post,
  PostInput,
  UpdatePostInput,
  PubSubTypes,
  PostSubscriptionPayload,
} from "../../types";

export default {
  Query: {
    getPosts: (
      parent: unknown,
      args: { commentId: string },
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
      context: { db: Database; pubSub: PubSub<PubSubTypes> }
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
        authorId: foundAuthor.id,
        published: args.postData.published,
      };

      db.posts.push(post);

      if (post.published) {
        context.pubSub.publish("post", {
          mutation: "CREATED",
          data: post,
        });
      }

      return post;
    },

    deletePost: (
      parent: unknown,
      args: { id: "string" },
      context: { db: Database; pubSub: PubSub<PubSubTypes> }
    ): Post => {
      const { db } = context;

      const postIndex = db.posts.findIndex(post => post.id === args.id);

      if (postIndex < 0) throw new Error("post not found");

      const post = db.posts.splice(postIndex, 1);
      db.comments = db.comments.filter(comment => comment.postId != args.id);

      if (post[0].published) {
        context.pubSub.publish("post", {
          mutation: "DELETED",
          data: post[0],
        });
      }

      return post[0];
    },

    updatePost: (
      parent: unknown,
      args: UpdatePostInput,
      context: { db: Database; pubSub: PubSub<PubSubTypes> }
    ): Post => {
      const { db } = context;
      const post = db.posts.find(post => post.id === args.id);

      if (!post) throw new Error("post not found");

      const originalPost = { ...post };

      if (typeof args.data.title === "string") {
        post.title = args.data.title;
      }

      if (typeof args.data.content === "string") {
        post.content = args.data.content;
      }

      if (typeof args.data.published === "boolean") {
        post.published = args.data.published;

        // publishing the post update specifying type

        if (originalPost.published && !post.published) {
          // in this case we can assume that post is marked as not published
          context.pubSub.publish("post", {
            mutation: "DELETED",
            data: originalPost, // return original data not the edited
          });
        } else if (!originalPost.published && post.published) {
          // post is now published
          context.pubSub.publish("post", {
            mutation: "CREATED",
            data: post,
          });
        }
      } else if (post.published) {
        // update
        context.pubSub.publish("post", {
          mutation: "UPDATED",
          data: post,
        });
      }

      return post;
    },
  },

  Subscription: {
    post: {
      subscribe: (
        parent: unknown,
        args: { postId: string },
        context: { db: Database; pubSub: PubSub<PubSubTypes> }
      ): Repeater<PostSubscriptionPayload> => {
        return context.pubSub.subscribe("post");
      },
      resolve: (payload: Post) => payload,
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
      parent: { id: string },
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
