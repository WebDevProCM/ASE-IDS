import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

/**
 *
 * @param {Object} user
 * @returns {string}
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateToken(user:Record<string,any>) {
  console.log("token: ", user)
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    // null for admin, customer, ho_manager
    warehouseId: user.rdcId?.toString(),
    tokenVersion: user.tokenVersion,
    rdcId:     typeof user.rdcId === 'object'
      ? user.rdcId._id.toString()
      : user.rdcId?.toString(),
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, JWT_SECRET!, options);
}

/**
 * 
 * @param {string} token
 * @returns {Object|null}
 */
export function verifyToken(token:string) {
  try {
    return jwt.verify(token, JWT_SECRET!);
  } catch (error) {
    return null;
  }
}

/**
 *
 * @param {Request} req
 * @returns {string|null}
 */
export function extractToken(req:Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}