import { PubSubTypes } from "../types";
import { createPubSub } from "@graphql-yoga/node";

const pubSub = createPubSub<PubSubTypes>() ;

export default pubSub;