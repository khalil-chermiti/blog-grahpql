import { randomUUID } from "crypto";
import { PubSub, Repeater } from "@graphql-yoga/node";
import prisma from "../../services/prisma.service";
import {
  User,
  CommentInput,
  Comment,
  PubSubTypes,
  UpdateCommentInput,
  CommentSubscriptionPayload,
} from "../../types";
import { getUserId } from "../../utils/getUserId";
import { GraphQLError } from "graphql";

export default {
  Query: {
    getComments: async (
      parent: {},
      args: {},
      context: {}
    ): Promise<Comment[]> => {
      return await prisma.comment.findMany({ take: 5 });
    },

    getComment: async (
      parent: {},
      args: { commentId: string },
      context: {}
    ): Promise<Comment | null> => {
      // return db.comments.find(comment => comment.id === args.commentId);
      return await prisma.comment.findUnique({
        where: {
          id: args.commentId,
        },
      });
    },
  },

  Mutation: {
    createComment: async (
      parent: {},
      args: CommentInput,
      context: { pubSub: PubSub<PubSubTypes>; request: Request }
    ): Promise<Comment | null> => {
      const jwtPayload = getUserId(context.request);
      if (!jwtPayload) throw new GraphQLError("please sign in !");

      const { pubSub } = context;

      const user = await prisma.user.findUnique({
        where: { id: jwtPayload.userId },
      });

      if (!user) throw new GraphQLError("user does not exist");

      const post = await prisma.post.findUnique({
        where: { id: args.commentData.postId },
      });

      if (!post) throw new GraphQLError("post does not exist");

      // if exit add Comment

      const comment: Comment = {
        id: randomUUID(),
        userId: jwtPayload.userId,
        postId: args.commentData.postId,
        content: args.commentData.content,
      };

      await prisma.comment.create({ data: comment });

      pubSub.publish("postId:comment", args.commentData.postId, {
        mutation: "CREATED",
        data: comment,
      });

      return comment;
    },

    deleteComment: async (
      parent: {},
      args: { id: "string" },
      context: { pubSub: PubSub<PubSubTypes>; request: Request }
    ): Promise<Comment> => {
      const jwtPayload = getUserId(context.request);
      if (!jwtPayload) throw new GraphQLError("please sign in !");

      const commentToDelete = await prisma.comment.findUnique({
        where: { id: args.id },
      });

      if (!commentToDelete) throw new GraphQLError("comment not found");

      if (commentToDelete.userId === jwtPayload.userId) {
        const comment = await prisma.comment.delete({ where: { id: args.id } });
        context.pubSub.publish("postId:comment", args.id, {
          mutation: "DELETED",
          data: comment,
        });

        return comment;
      } else {
        throw new Error("can't delete comment !");
      }
    },

    updateComment: async (
      parent: {},
      args: UpdateCommentInput,
      context: { pubSub: PubSub<PubSubTypes>; request: Request }
    ): Promise<Comment> => {
      const jwtPayload = getUserId(context.request);
      if (!jwtPayload) throw new GraphQLError("please sign in !");

      const commentToUpdate = await prisma.comment.findUnique({
        where: { id: args.id },
      });

      if (!commentToUpdate) throw new GraphQLError("comment not found");

      if (commentToUpdate.userId === jwtPayload.userId) {
        if (typeof args.data.content === "string") {
          commentToUpdate.content = args.data.content;
        }

        await prisma.comment.update({
          where: { id: args.id },
          data: commentToUpdate,
        });

        context.pubSub.publish("postId:comment", commentToUpdate.postId, {
          mutation: "UPDATED",
          data: commentToUpdate,
        });

        return commentToUpdate;
      } else {
        throw new GraphQLError("can't update comment !");
      }
    },
  },

  Subscription: {
    comment: {
      subscribe: async (
        parent: {},
        args: { postId: string },
        context: { pubSub: PubSub<PubSubTypes> }
      ): Promise<Repeater<CommentSubscriptionPayload>> => {
        const { pubSub } = context;

        const post = await prisma.post.findUnique({
          where: { id: args.postId },
        });
        if (!post) throw new Error("post not found");

        // subscribe to specific post comments change events
        return pubSub.subscribe("postId:comment", args.postId);
      },
      resolve: (payload: Comment) => payload,
    },
  },

  Comment: {
    user: async (
      parent: { userId: string },
      args: {},
      context: {}
    ): Promise<User | null> => {
      return await prisma.user.findUnique({ where: { id: parent.userId } });
    },
  },
};
