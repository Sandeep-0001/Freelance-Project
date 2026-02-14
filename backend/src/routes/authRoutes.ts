import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { signAuthToken } from "@/lib/jwt";
import { hashPassword, verifyPassword } from "@/lib/password";
import { generateUniqueReferralCode } from "@/lib/referral";
import { findBinaryPlacement } from "@/lib/binaryPlacement";
import { getBusinessOpportunityEmailContent } from "@/lib/businessOpportunity";
import { sendEmail } from "@/lib/email";
import { authValidation, sendValidationError, sendSuccessResponse, VALIDATION_MESSAGES, formatZodError } from "@/lib/validation";
import { UserModel } from "@/models/User";
import { authLimiter, requireAuth, setAuthCookie, clearAuthCookie, DUMMY_PASSWORD_HASH } from "@/middleware/auth";

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Check if email or phone exists
router.post("/check-exists", async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ error: "Email or phone is required" });
    }

    await connectToDatabase();
    
    const isEmail = emailOrPhone.includes('@');
    const user = await UserModel.findOne(
      isEmail 
        ? { email: emailOrPhone.toLowerCase() }
        : { mobile: emailOrPhone }
    ).select("_id");

    return res.json({ exists: !!user });
  } catch (err: unknown) {
    console.error('Error checking user existence:', err);
    const msg = err instanceof Error ? err.message : VALIDATION_MESSAGES.SERVER_ERROR;
    return res.status(500).json({ error: msg });
  }
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    const body = authValidation.register.parse(req.body);
    await connectToDatabase();

    // Check if mobile already exists
    const existingMobile = await UserModel.findOne({ mobile: body.mobile }).select("_id");
    if (existingMobile) return sendValidationError(res, VALIDATION_MESSAGES.MOBILE_EXISTS, 409);

    // Check if email already exists
    const existingEmail = await UserModel.findOne({ email: body.email.toLowerCase() }).select("_id");
    if (existingEmail) return sendValidationError(res, VALIDATION_MESSAGES.EMAIL_EXISTS, 409);

    let parentId: mongoose.Types.ObjectId | null = null;
    let position: "left" | "right" | null = null;

    if (body.referralCode) {
      const sponsor = await UserModel.findOne({ referralCode: body.referralCode }).select("_id");
      if (!sponsor) return sendValidationError(res, "Invalid referral code");

      const placement = await findBinaryPlacement({ sponsorId: sponsor._id });
      parentId = placement.parentId;
      position = placement.position;
    }

    const passwordHash = await hashPassword(body.password);
    const referralCode = await generateUniqueReferralCode();

    const user = await UserModel.create({
      mobile: body.mobile,
      countryCode: body.countryCode,
      name: body.name,
      fullName: body.fullName,
      email: body.email.toLowerCase(),
      passwordHash,
      role: "user",
      referralCode,
      parent: parentId,
      position,
    });

    // Non-blocking welcome email
    setTimeout(async () => {
      try {
        const content = getBusinessOpportunityEmailContent();
        if (user.email) {
          await sendEmail({ to: user.email, subject: content.subject, text: content.text });
        }
      } catch (err) {
        console.error("Failed to send welcome email:", err);
      }
    }, 0);

    return sendSuccessResponse(res, {
      user: {
        _id: user._id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
      }
    }, "Registration successful");
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return sendValidationError(res, formatZodError(err));
    }
    const msg = err instanceof Error ? err.message : VALIDATION_MESSAGES.SERVER_ERROR;
    return sendValidationError(res, msg);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const body = authValidation.login.parse(req.body);
    await connectToDatabase();

    // Check if input is email or phone
    const emailOrPhone = body.emailOrPhone.trim();
    const isEmail = emailOrPhone.includes('@');
    
    // Find user by email or mobile
    const user = await UserModel.findOne(
      isEmail 
        ? { email: emailOrPhone }
        : { mobile: emailOrPhone }
    );
    
    if (!user) {
      await verifyPassword(body.password, DUMMY_PASSWORD_HASH);
      return sendValidationError(res, "Invalid email/phone or password", 401);
    }

    const isValidPassword = await verifyPassword(body.password, user.passwordHash);
    if (!isValidPassword) return sendValidationError(res, "Invalid email/phone or password", 401);

    if (user.status === "deleted") return sendValidationError(res, VALIDATION_MESSAGES.ACCOUNT_DELETED, 403);
    if (user.status === "suspended") return sendValidationError(res, VALIDATION_MESSAGES.ACCOUNT_SUSPENDED, 403);

    const token = await signAuthToken({ sub: user._id.toString(), role: user.role, email: user.email || undefined });
    setAuthCookie(res, token);

    await UserModel.findByIdAndUpdate(user._id, { 
      lastLoginAt: new Date(),
      activityStatus: "active"
    });

    return sendSuccessResponse(res, {
      user: {
        _id: user._id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
      }
    }, "Login successful");
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return sendValidationError(res, formatZodError(err));
    }
    const msg = err instanceof Error ? err.message : VALIDATION_MESSAGES.SERVER_ERROR;
    return sendValidationError(res, msg);
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    await connectToDatabase();

    // Update user activity status to inactive on logout
    await UserModel.findByIdAndUpdate(ctx.userId, { 
      activityStatus: "inactive",
      lastLogoutAt: new Date()
    });

    clearAuthCookie(res);
    res.json({ ok: true });
  } catch (err: unknown) {
    // Even if auth fails, clear the cookie
    clearAuthCookie(res);
    const msg = err instanceof Error ? err.message : "Logout failed";
    return res.status(400).json({ error: msg });
  }
});

export default router;
