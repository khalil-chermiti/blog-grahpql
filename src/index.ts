import path from "path";
import * as dotenv from "dotenv";
import pubSub from "./schema/pubSub";
import prisma from "./services/prisma.service";
import { createServer } from "@graphql-yoga/node";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

dotenv.config();

// load and merge graphql type definitions
const loadedTypeFiles = loadFilesSync(
  `${__dirname}/schema/typeDefs/**/*.graphql`
);
const typeDefs = mergeTypeDefs(loadedTypeFiles);

// load and merge graphql resolvers
const resolversArray = loadFilesSync(
  path.join(__dirname, "./**/*.resolvers.*")
);
const resolvers = mergeResolvers(resolversArray);

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
  context: () => {
    return { pubSub };
  },
  maskedErrors: false,
});

async function startServer() {
  await prisma
    .$connect()
    .then(
      () => console.log("connected to postgresql 🐘✨"),
      () => console.log("could not connect to postgresql 🛟")
    )
    .catch(err => console.log("error connecting to database", err));

  server.start();
}

startServer();
