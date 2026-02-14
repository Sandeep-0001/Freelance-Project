import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { verifyAuthToken } from "@/lib/jwt";
import { env } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { UserModel, type UserRole } from "@/models/User";

export type AuthContext = { userId: string; role: UserRole; email: string };

// Stricter rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export function getTokenFromReq(req: Request) {
  const cookieToken = (req.cookies?.token as string | undefined) ?? undefined;
  const header = req.header("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7) : undefined;
  return cookieToken ?? bearer;
}

export async function requireAuth(req: Request): Promise<AuthContext> {
  const token = getTokenFromReq(req);
  if (!token) throw new Error("Authentication required. Please log in to continue.");

  const payload = await verifyAuthToken(token);
  const role = payload.role;
  const email = payload.email as string;

  if (!payload.sub || !role || !email) throw new Error("Invalid authentication token. Please log in again.");
  
  // Verify user still exists and is active
  await connectToDatabase();
  const user = await UserModel.findById(payload.sub).select("status sessionExpiresAt activityStatus").lean();
  
  if (!user) throw new Error("User account not found. Please contact support if you believe this is an error.");
  if (user.status === "deleted") throw new Error("Account has been deleted");
  if (user.status === "suspended") throw new Error("Account has been suspended by administrator");
  if (user.sessionExpiresAt && new Date(user.sessionExpiresAt) < new Date()) {
    // Update activity status to inactive on session expiration
    await UserModel.findByIdAndUpdate(payload.sub, { 
      activityStatus: "inactive",
      lastLogoutAt: new Date()
    });
    throw new Error("Session has expired");
  }
  
  return { userId: payload.sub, role, email };
}

export async function requireRole(req: Request, role: UserRole): Promise<AuthContext> {
  const ctx = await requireAuth(req);
  if (ctx.role !== role) throw new Error("Forbidden");
  return ctx;
}

export async function requireAdminRole(req: Request): Promise<AuthContext> {
  const ctx = await requireAuth(req);
  if (!["super_admin", "admin", "moderator"].includes(ctx.role)) throw new Error("Forbidden");
  return ctx;
}

export async function requireSuperAdminOrAdmin(req: Request): Promise<AuthContext> {
  const ctx = await requireAuth(req);
  if (!["super_admin", "admin"].includes(ctx.role)) throw new Error("Forbidden");
  return ctx;
}

export function setAuthCookie(res: Response, token: string) {
  const isProduction = env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie("token", { path: "/" });
}

export const DUMMY_PASSWORD_HASH = "$2b$12$npwxPAElS4BfdU.iS5LIFuqi0v31VhieuIsoP1t9cMORH152MK/3i";
