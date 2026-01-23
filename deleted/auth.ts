import bcrypt from "bcrypt";
import type { User, UserWithoutPassword } from "../shared/schema";

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Remove password from user object for safe API responses
 */
export function sanitizeUser(user: User): UserWithoutPassword {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Check if user has required role
 */
export function hasRole(user: UserWithoutPassword | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Check if user is admin or superadmin
 */
export function isAdmin(user: UserWithoutPassword | null): boolean {
  return hasRole(user, ["admin", "superadmin"]);
}
