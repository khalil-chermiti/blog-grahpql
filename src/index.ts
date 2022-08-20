import path from "path";
import db from "./model/db";
import { createServer } from "@graphql-yoga/node";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

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
  context: db,
});
server.start();
