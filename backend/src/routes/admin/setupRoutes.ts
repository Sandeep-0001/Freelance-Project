import { Router } from "express";
import { z } from "zod";
import { env } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generateUniqueReferralCode } from "@/lib/referral";
import { UserModel } from "@/models/User";

const router = Router();

// Admin initial setup
router.post("/setup", async (req, res) => {
  const schema = z.object({
    secret: z.string().min(1),
    name: z.string().min(1).optional(),
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(8),
  });

  try {
    const body = schema.parse(req.body);

    if (!env.ADMIN_SETUP_SECRET) return res.status(500).json({ error: "ADMIN_SETUP_SECRET not configured" });
    if (body.secret !== env.ADMIN_SETUP_SECRET) return res.status(403).json({ error: "Forbidden" });

    await connectToDatabase();

    const existingAdmin = await UserModel.exists({ role: "admin" });
    if (existingAdmin) return res.status(409).json({ error: "Admin already exists" });

    const existingEmail = await UserModel.exists({ email: body.email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await hashPassword(body.password);
    const referralCode = await generateUniqueReferralCode();

    const admin = await UserModel.create({
      name: body.name ?? "Admin",
      email: body.email,
      passwordHash,
      role: "admin",
      referralCode,
      parent: null,
      position: null,
    });

    return res.json({
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        referralCode: admin.referralCode,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Bad request";
    return res.status(400).json({ error: msg });
  }
});

export default router;
