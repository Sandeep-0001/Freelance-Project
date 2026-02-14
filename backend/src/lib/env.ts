import { z } from "zod";

// Centralized env parsing keeps runtime errors obvious and early.
// Only import this from server-side code (route handlers, server components).
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(64, "JWT_SECRET should be at least 64 chars"),

  // Used once to bootstrap the first admin.
  ADMIN_SETUP_SECRET: z.string().min(8).optional(),

  // Cookie settings
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),

  // Optional SMTP settings (used for Business Opportunity emails).
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().min(3).optional(),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_SETUP_SECRET: process.env.ADMIN_SETUP_SECRET,
  NODE_ENV: process.env.NODE_ENV,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
});
