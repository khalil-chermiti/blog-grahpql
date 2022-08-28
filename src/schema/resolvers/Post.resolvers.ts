import { randomUUID } from "crypto";
import prisma from "../../services/prisma.service";
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
    getPosts: async (
      parent: unknown,
      args: { commentId: string },
      context: {}
    ): Promise<Post[]> => {
      return await prisma.post.findMany({ take: 5 });
    },

    getPost: async (
      parent: unknown,
      args: { postId: string },
      context: {}
    ): Promise<Post | null> => {
      return await prisma.post.findUnique({ where: { id: args.postId } });
    },
  },

  Mutation: {
    createPost: async (
      parent: unknown,
      args: PostInput,
      context: { pubSub: PubSub<PubSubTypes> }
    ): Promise<Post> => {
      const foundAuthor = await prisma.user.findUnique({
        where: { id: args.postData.author },
      });

      if (!foundAuthor) throw new Error("author does not exist");

      const post: Post = {
        id: randomUUID(),
        title: args.postData.title,
        content: args.postData.content,
        authorId: foundAuthor.id,
        published: args.postData.published,
      };

      const createdPost = await prisma.post.create({ data: post });

      if (createdPost.published) {
        context.pubSub.publish("post", {
          mutation: "CREATED",
          data: post,
        });
      }

      return post;
    },

    deletePost: async (
      parent: unknown,
      args: { id: "string" },
      context: { pubSub: PubSub<PubSubTypes> }
    ): Promise<Post> => {
      const postToDelete = await prisma.post.findUnique({
        where: { id: args.id },
      });
      if (!postToDelete) throw new Error("post not found");

      await prisma.comment.deleteMany({ where: { postId: args.id } });
      await prisma.post.delete({ where: { id: args.id } });

      // if post is published we need to inform subscribers that
      // post got deleted
      if (postToDelete.published) {
        context.pubSub.publish("post", {
          mutation: "DELETED",
          data: postToDelete,
        });
      }

      return postToDelete;
    },

    updatePost: async (
      parent: unknown,
      args: UpdatePostInput,
      context: { pubSub: PubSub<PubSubTypes> }
    ): Promise<Post> => {
      const postToUpdate = await prisma.post.findUnique({
        where: { id: args.id },
      });
      if (!postToUpdate) throw new Error("post not found");

      const originalPost = { ...postToUpdate };

      if (typeof args.data.title === "string") {
        postToUpdate.title = args.data.title;
      }

      if (typeof args.data.content === "string") {
        postToUpdate.content = args.data.content;
      }

      if (typeof args.data.published === "boolean") {
        postToUpdate.published = args.data.published;

        // publishing the post update specifying type

        if (originalPost.published && !postToUpdate.published) {
          // in this case we can assume that post is marked as not published

          context.pubSub.publish("post", {
            mutation: "DELETED",
            data: originalPost, // return original data not the edited
          });
        } else if (!originalPost.published && postToUpdate.published) {
          // post is now published
          context.pubSub.publish("post", {
            mutation: "CREATED",
            data: postToUpdate,
          });
        }
      } else if (postToUpdate.published) {
        // update
        context.pubSub.publish("post", {
          mutation: "UPDATED",
          data: postToUpdate,
        });
      }

      // after publishing the update we save the new object to db
      return await prisma.post.update({
        where: { id: args.id },
        data: postToUpdate,
      });
    },
  },

  Subscription: {
    post: {
      subscribe: (
        parent: unknown,
        args: { postId: string },
        context: { pubSub: PubSub<PubSubTypes> }
      ): Repeater<PostSubscriptionPayload> => {
        return context.pubSub.subscribe("post");
      },
      resolve: (payload: Post) => payload,
    },
  },

  Post: {
    author: async (
      parent: { authorId: string },
      args: {},
      context: {}
    ): Promise<User | null> => {
      return await prisma.user.findUnique({ where: { id: parent.authorId } });
    },

    comments: async (
      parent: { id: string },
      args: {},
      context: { db: Database }
    ): Promise<Comment[]> => {
      return await prisma.comment.findMany({ where: { postId: parent.id } });
    },
  },
};
