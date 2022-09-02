import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import prisma from "../../services/prisma.service";
import {
  Post,
  User,
  UserInput,
  UpdateUserInput,
  AuthPayload,
} from "../../types";

export default {
  Query: {
    getUser: async (
      parent: unknown,
      args: { id: string },
      context: {}
    ): Promise<User | null> => {
      return await prisma.user.findUnique({ where: { id: args.id } });
    },
  },

  Mutation: {
    createUser: async (
      parent: unknown,
      args: UserInput,
      context: {}
    ): Promise<AuthPayload> => {
      const isEmailTaken = await prisma.user.findUnique({
        where: { email: args.userData.email },
      });

      if (isEmailTaken) throw new Error("email is taken");

      if (
        args.userData.password.length < 6 ||
        typeof args.userData.password !== "string"
      ) {
        throw new Error("please enter a valid password");
      }

      const user = {
        id: randomUUID(),
        name: args.userData.name,
        email: args.userData.email,
      };

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(args.userData.password, salt);

      // save user
      await prisma.user.create({
        data: { ...user, password: hashedPassword },
      });

      return {
        data: user,
        token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET),
      };
    },

    deleteUser: async (
      parent: unknown,
      args: { id: "string" },
      context: {}
    ): Promise<User> => {
      await prisma.post.deleteMany({ where: { authorId: args.id } });

      await prisma.comment.deleteMany({ where: { userId: args.id } });

      return await prisma.user.delete({ where: { id: args.id } });
    },

    updateUser: async (
      parent: unknown,
      args: UpdateUserInput,
      context: {},
      info: unknown
    ): Promise<User> => {
      const user = await prisma.user.findUnique({ where: { id: args.id } });

      if (!user) throw new Error("user not found");

      if (typeof args.data.email === "string") {
        const emailTaken = await prisma.user.findUnique({
          where: { email: args.data.email },
        });

        if (emailTaken) throw new Error("email is taken");
      }

      await prisma.user.update({
        where: { id: args.id },
        data: { name: args.data.name, email: args.data.email },
      });

      return user;
    },
  },

  User: {
    posts: async (
      parent: { id: string },
      args: {},
      context: {}
    ): Promise<Post[]> => {
      return await prisma.post.findMany({ where: { authorId: parent.id } });
    },
  },
};
