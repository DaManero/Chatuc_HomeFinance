import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAccessToken(payload) {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.accessTtl,
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.refreshTtl,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (err) {
    return null;
  }
}
