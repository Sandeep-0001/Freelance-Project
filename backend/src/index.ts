import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";

const backendEnvPath = path.resolve(__dirname, "../.env");
const repoRootEnvPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: fs.existsSync(backendEnvPath) ? backendEnvPath : repoRootEnvPath });


const app = express();

// Trust proxy for rate limiting when behind reverse proxy/load balancer
app.set('trust proxy', 1);

const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000,http://localhost:3001";

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP temporarily to debug
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Support multiple CORS origins (comma-separated)
const allowedOrigins = corsOrigin.split(",").map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin for development tools and mobile apps
      if (!origin) return callback(null, true);
      
      // Strict origin validation for production
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Serve static files from the uploads directory with CORS headers (for imports only)
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", cors(), express.static(uploadsPath));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

async function main() {
  // Connect to MongoDB on startup
  const { connectToDatabase } = await import("./lib/db");
  await connectToDatabase();

  const { registerRoutes } = await import("./routes");
  registerRoutes(app);

  // Always return JSON for errors so the frontend can safely parse them.
  // This also handles body-parser JSON errors and other thrown exceptions.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    // Log errors without sensitive information
    console.error(`[Server] Error: ${message}`);
    res.status(400).json({ error: message });
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`[Server] ReferGrow API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(`[Server] Startup error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  process.exit(1);
});
