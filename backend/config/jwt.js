import jwt from "jsonwebtoken";

export const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);
