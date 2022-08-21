import { randomUUID } from "crypto";
import { Database, Post, User, UserInput, UpdateUserInput } from "../../types";

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

    updateUser: (
      parent: unknown,
      args: UpdateUserInput,
      context: { db: Database },
      info: unknown
    ): User => {
      const { db } = context;
      const user = db.users.find(user => user.id === args.id);

      if (!user) throw new Error("user not found");

      if (typeof args.data.email === "string") {
        const emailTaken = db.users.some(
          user => user.email === args.data.email
        );

        if (emailTaken) throw new Error("email is taken");
        user.email = args.data.email;
      }

      if (typeof args.data.name === "string") {
        user.name = args.data.name;
      }

      if (typeof args.data.age !== "undefined") {
        user.age = args.data.age;
      }

      return user;
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
