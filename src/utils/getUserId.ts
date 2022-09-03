import { GraphQLError } from "graphql";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

interface UserJwtToken extends JwtPayload {
  userId: string;
}

export const getUserId = (request: Request): UserJwtToken | null => {
  let jwtToken =
    request.headers.get("Authorization") ||
    request.headers.get("authorization");

  if (!jwtToken) throw new GraphQLError("unallowed action, please login !");

  jwtToken = jwtToken.split(" ")[1];
  const secret: Secret = process.env.JWT_SECRET;

  try {
    let userId = jwt.verify(jwtToken, secret) as UserJwtToken;
    return userId;
  } catch (err) {
    return null;
  }
};
