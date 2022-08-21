import { randomUUID } from "crypto";
import { User, Database, CommentInput, Comment, UpdateCommentInput } from "../../types";

export default {
  Query: {
    getComments: (
      parent: unknown,
      args: {},
      context: { db: Database }
    ): Comment[] => {
      return context.db.comments;
    },

    getComment: (
      parent: unknown,
      args: { commentId: String },
      context: { db: Database }
    ): Comment | undefined => {
      const { db } = context;
      return db.comments.find(comment => comment.id === args.commentId);
    },
  },

  Mutation: {
    createComment: (
      parent: unknown,
      args: CommentInput,
      context: { db: Database }
    ): Comment => {
      const { db } = context;

      // find user
      const foundAuthor = db.users.some(
        user => user.id === args.commentData.userId
      );
      if (!foundAuthor) throw new Error("userId not found");

      // find post
      const foundPost = db.posts.some(
        post => post.id === args.commentData.postId
      );
      if (!foundPost) throw new Error("postId not found");

      // if exit add Comment

      const comment: Comment = {
        id: randomUUID(),
        userId: args.commentData.userId,
        postId: args.commentData.postId,
        content: args.commentData.content,
      };

      db.comments.push(comment);

      return comment;
    },

    deleteComment: (
      parent: unknown,
      args: { id: "string" },
      context: { db: Database }
    ): Comment => {
      const { db } = context;

      const commentIndex = db.comments.findIndex(
        comment => comment.id === args.id
      );

      if (commentIndex < 0) throw new Error("comment not found");

      const comment = db.comments.splice(commentIndex, 1);
      db.comments = db.comments.filter(comment => comment.id != args.id);

      return comment[0];
    },

    updateComment: (
      parent: unknown,
      args: UpdateCommentInput,
      context: { db: Database }
    ) : Comment => {
      const {db} = context; 
      const comment = db.comments.find(comment => comment.id === args.id);

      if (!comment) throw new Error("comment not found") ;

      if (typeof args.data.content === "string") {
        comment.content = args.data.content ;
      }

      return comment;
    }
  },

  Comment: {
    user: (
      parent: { userId: string },
      args: {},
      context: { db: Database }
    ): User | undefined => {
      const { db } = context;
      return db.users.find(user => user.id === parent.userId);
    },
  },
};
