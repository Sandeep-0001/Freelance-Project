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
import { PasswordResetModel } from "@/models/PasswordReset";
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

    // Generate JWT and set auth cookie so user is logged in after registration
    const token = await signAuthToken({ sub: user._id.toString(), role: user.role, email: user.email || undefined });
    setAuthCookie(res, token);

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

// Generate OTP (6 digits)
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Forgot Password - Request OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email("Invalid email address"),
    });

    const body = schema.parse(req.body);
    await connectToDatabase();

    // Check if user exists
    const user = await UserModel.findOne({ email: body.email.toLowerCase() }).select("_id email name");
    if (!user) {
      // Don't reveal if email exists or not for security
      return sendSuccessResponse(res, {}, "If the email exists, an OTP has been sent to it");
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any previous OTP requests for this email
    await PasswordResetModel.deleteMany({ email: body.email.toLowerCase() });

    // Store OTP
    await PasswordResetModel.create({
      email: body.email.toLowerCase(),
      otp,
      expiresAt,
    });

    // Send OTP email
    try {
      await sendEmail({
        to: user.email!,
        subject: "Password Reset OTP - ReferGrow",
        text: `Hi ${user.name},\n\nYour password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nReferGrow Team`,
      });
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      return sendValidationError(res, "Failed to send OTP email. Please try again later.", 500);
    }

    return sendSuccessResponse(res, {}, "OTP has been sent to your email");
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return sendValidationError(res, formatZodError(err));
    }
    console.error('Error in forgot-password:', err);
    const msg = err instanceof Error ? err.message : VALIDATION_MESSAGES.SERVER_ERROR;
    return sendValidationError(res, msg);
  }
});

// Reset Password - Verify OTP and Update Password
router.post("/reset-password", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email("Invalid email address"),
      otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    });

    const body = schema.parse(req.body);
    await connectToDatabase();

    // Find valid OTP
    const resetRequest = await PasswordResetModel.findOne({
      email: body.email.toLowerCase(),
      otp: body.otp,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRequest) {
      return sendValidationError(res, "Invalid or expired OTP", 400);
    }

    // Find user
    const user = await UserModel.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      return sendValidationError(res, "User not found", 404);
    }

    // Update password
    const passwordHash = await hashPassword(body.newPassword);
    await UserModel.findByIdAndUpdate(user._id, { passwordHash });

    // Mark OTP as used
    await PasswordResetModel.findByIdAndUpdate(resetRequest._id, { used: true, verified: true });

    // Send confirmation email
    try {
      await sendEmail({
        to: user.email!,
        subject: "Password Reset Successful - ReferGrow",
        text: `Hi ${user.name},\n\nYour password has been successfully reset.\n\nIf you didn't make this change, please contact support immediately.\n\nBest regards,\nReferGrow Team`,
      });
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

    return sendSuccessResponse(res, {}, "Password has been reset successfully. You can now login with your new password.");
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return sendValidationError(res, formatZodError(err));
    }
    console.error('Error in reset-password:', err);
    const msg = err instanceof Error ? err.message : VALIDATION_MESSAGES.SERVER_ERROR;
    return sendValidationError(res, msg);
  }
});

export default router;
