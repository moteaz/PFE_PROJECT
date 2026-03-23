import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"];
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

export type JwtPayload = { sub: string; role: string };

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload & { iat: number; exp: number };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload & { iat: number; exp: number };
}
