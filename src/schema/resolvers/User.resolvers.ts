import { randomUUID } from "crypto";
import { Database, Post, User, UserInput } from "../../types";

export default {
  Query: {
    getUser: (
      parent: unknown,
      args: { id: string },
      context: { db: Database }
    ): User | undefined => {
      const { db } = context;
      return db.users.find(user => user.id === args.id);
    },
  },

  Mutation: {
    createUser: (
      parent: unknown,
      args: UserInput,
      context: { db: Database }
    ): User => {
      const { db } = context;

      const isEmailTaken = db.users.some(
        user => user.email === args.userData.email
      );
      if (isEmailTaken) throw new Error("email is taken");

      const user: User = {
        id: randomUUID(),
        name: args.userData.name,
        email: args.userData.email,
        age: args.userData.age,
      };

      db.users.push(user);

      return user;
    },

    deleteUser: (
      parent: unknown,
      args: { id: "string" },
      context: { db: Database }
    ): User => {
      const { db } = context;

      const userIndex = db.users.findIndex(user => user.id === args.id);

      if (userIndex < 0) throw new Error("user not found");

      const deletedUser = db.users.splice(userIndex, 1);

      // delete comments and posts created by user
      db.posts = db.posts.filter(post => post.author != args.id);
      db.comments = db.comments.filter(comment => comment.userId != args.id);

      return deletedUser[0];
    },
  },

  User: {
    posts: (
      parent: { id: string },
      args: {},
      context: { db: Database }
    ): Post[] => {
      const { db } = context;

      let postsArray: Post[] = [];

      db.posts.forEach(post => {
        if (post?.author === parent.id) postsArray.push(post);
      });

      return postsArray;
    },
  },
};
