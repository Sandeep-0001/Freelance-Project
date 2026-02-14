import mongoose from "mongoose";
import { env } from "@/lib/env";

// Next.js API routes may hot-reload in dev, so we cache the connection
// in the Node.js global to avoid creating many connections.

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cached = global.__mongooseConn ?? { conn: null, promise: null };
global.__mongooseConn = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // eslint-disable-next-line no-console
    console.log("[MongoDB] Connecting...");
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        // Keep defaults; tune here if needed (pool sizes, timeouts, etc.).
      })
      .then((m) => {
        // eslint-disable-next-line no-console
        console.log("[MongoDB] Connected successfully");
        return m;
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[MongoDB] Connection error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
