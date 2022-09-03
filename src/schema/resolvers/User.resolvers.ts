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
  UserLoginInput,
} from "../../types";
import { getUserId } from "../../utils/getUserId";
import { GraphQLError } from "graphql";

export default {
  Query: {
    getUser: async (
      parent: unknown,
      args: { id: string },
      context: {}
    ): Promise<User | null> => {
      return await prisma.user.findUnique({ where: { id: args.id } });
    },

    login: async (
      parent: unknown,
      args: UserLoginInput,
      context: { request: Request }
    ): Promise<AuthPayload | null> => {
      let jwtPayload = getUserId(context.request);
      if (jwtPayload) throw new GraphQLError("already logged in!");

      const user = await prisma.user.findUnique({
        where: { email: args.loginData.email },
      });

      if (!user)
        throw new GraphQLError("invalid email , please verify your login");

      const validLogin = await bcrypt.compare(
        args.loginData.password,
        user.password
      );

      if (!validLogin) {
        throw new GraphQLError("wrong password !");
      }

      return {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET),
      };
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

      if (isEmailTaken)
        throw new GraphQLError("email is taken, verify your login!");

      if (
        args.userData.password.length < 6 ||
        typeof args.userData.password !== "string"
      ) {
        throw new GraphQLError("unvalid password, please enter a valid one!");
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
      context: { request: Request }
    ): Promise<User> => {
      let jwtPayload = getUserId(context.request);

      if (!jwtPayload)
        throw new GraphQLError("not allowed action, please login !");

      const userToDelete = await prisma.user.findUnique({
        where: { id: jwtPayload.userId },
      });

      if (!userToDelete) throw new GraphQLError("user does not exist !");

      try {
        // delete user's comments and posts
        await prisma.comment.deleteMany({
          where: { Post: { authorId: jwtPayload.userId } },
        });
        await prisma.post.deleteMany({
          where: { authorId: jwtPayload.userId },
        });
        await prisma.comment.deleteMany({
          where: { userId: jwtPayload.userId },
        });

        return await prisma.user.delete({ where: { id: jwtPayload.userId } });
      } catch (err: unknown) {
        throw new GraphQLError(
          "something went wrong while deleting user, please try again"
        );
      }
    },

    updateUser: async (
      parent: unknown,
      args: UpdateUserInput,
      context: { request: Request }
    ): Promise<User> => {
      const jwtPayload = getUserId(context.request);

      if (!jwtPayload) throw new GraphQLError("user please login !");

      const user = await prisma.user.findUnique({
        where: { id: jwtPayload.userId },
      });

      if (!user) throw new GraphQLError("user doesn't exist !");

      if (typeof args.data.email === "string") {
        const emailTaken = await prisma.user.findUnique({
          where: { email: args.data.email },
        });

        if (emailTaken) throw new GraphQLError("email is taken");
      }

      await prisma.user.update({
        where: { id: jwtPayload.userId },
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
