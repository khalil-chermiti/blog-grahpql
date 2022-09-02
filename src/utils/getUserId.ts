import jwt, { Secret } from "jsonwebtoken";

export const getUserId = (request: Request) => {
  const jwtToken =
    request.headers.get("Authorization") ||
    request.headers.get("authorization");

  if (!jwtToken) throw new Error("please sign in");

  const secret: Secret = process.env.JWT_SECRET;
  const decodedToken = jwt.verify(jwtToken, secret);

  if (!decodedToken) throw new Error("please sign in");

  return decodedToken;
};
