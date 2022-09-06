import jwt, { JwtPayload, Secret } from "jsonwebtoken";

/*
* this is the full Graphql-yoga context

import { IncomingMessage, ServerResponse } from "http";
import { YogaInitialContext } from "@graphql-yoga/node";
interface Context extends YogaInitialContext {
  req: IncomingMessage;
  res: ServerResponse;
}
*/

interface UserJwtToken extends JwtPayload {
  userId: string;
}

export const getUserId = (request: Request): UserJwtToken | null => {
  let jwtToken =
    request.headers.get("Authorization") ||
    request.headers.get("authorization");

  if (!jwtToken) return null;

  jwtToken = jwtToken.split(" ")[1];
  const secret: Secret = process.env.JWT_SECRET;

  try {
    let userId = jwt.verify(jwtToken, secret) as UserJwtToken;
    return userId;
  } catch (err) {
    return null;
  }
};
