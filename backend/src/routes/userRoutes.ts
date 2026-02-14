import { Router } from "express";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { authValidation, sendValidationError, sendSuccessResponse, VALIDATION_MESSAGES, formatZodError } from "@/lib/validation";
import { UserModel } from "@/models/User";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// Get current user info (for auth state)
router.get("/me", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    await connectToDatabase();

    const user = await UserModel.findById(ctx.userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        profileImage: user.profileImage,
        parentUserId: user.parent?.toString() ?? null,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unable to retrieve user information";
    const status = msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

// Get full profile
router.get("/profile", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    await connectToDatabase();

    const user = await UserModel.findById(ctx.userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    return res.json({
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        countryCode: user.countryCode,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        referralCode: user.referralCode,
        
        // Business Settings
        businessName: user.businessName,
        companyPhone: user.companyPhone,
        companyEmail: user.companyEmail,
        website: user.website,
        billingAddress: user.billingAddress,
        state: user.state,
        pincode: user.pincode,
        city: user.city,
        language: user.language,
        businessType: user.businessType,
        industryType: user.industryType,
        businessDescription: user.businessDescription,
        gstin: user.gstin,
        panNumber: user.panNumber,
        isGSTRegistered: user.isGSTRegistered,
        enableEInvoicing: user.enableEInvoicing,
        enableTDS: user.enableTDS,
        enableTCS: user.enableTCS,
        businessLogo: user.businessLogo,
        profileImage: user.profileImage,
        signature: user.signature,
        currencyCode: user.currencyCode,
        currencySymbol: user.currencySymbol,
        
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unable to retrieve profile information";
    const status = msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

// Update basic profile info
router.put("/profile/basic", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    const body = authValidation.updateProfile.parse(req.body);
    await connectToDatabase();

    // Check if email already exists (if updating email)
    if (body.email) {
      const existingEmail = await UserModel.findOne({ 
        email: body.email.toLowerCase(),
        _id: { $ne: ctx.userId }
      }).select("_id");
      if (existingEmail) return sendValidationError(res, VALIDATION_MESSAGES.EMAIL_EXISTS, 409);
    }

    const user = await UserModel.findByIdAndUpdate(
      ctx.userId, 
      body, 
      { new: true }
    );

    if (!user) return sendValidationError(res, "User not found", 404);

    return sendSuccessResponse(res, {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      }
    }, "Profile updated successfully");
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return sendValidationError(res, formatZodError(err));
    }
    console.error('Error updating profile:', err);
    const msg = err instanceof Error ? err.message : "Unable to update profile";
    const status = msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return sendValidationError(res, msg, status);
  }
});

// Update business settings
router.put("/profile/business", async (req, res) => {
  const schema = z.object({
    businessName: z.string().optional(),
    companyPhone: z.string().optional(),
    companyEmail: z.string().email({ message: "Invalid email format" }).optional(),
    website: z.string().url({ message: "Invalid URL format" }).optional(),
    billingAddress: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    city: z.string().optional(),
    language: z.string().optional(),
    businessType: z.string().optional(),
    industryType: z.string().optional(),
    businessDescription: z.string().optional(),
    gstin: z.string().optional(),
    panNumber: z.string().optional(),
    isGSTRegistered: z.boolean().optional(),
    enableEInvoicing: z.boolean().optional(),
    enableTDS: z.boolean().optional(),
    enableTCS: z.boolean().optional(),
    businessLogo: z.string().url({ message: "Invalid URL format" }).optional(),
    signature: z.string().optional(),
    currencyCode: z.string().optional(),
    currencySymbol: z.string().optional(),
  }).refine((v) => Object.keys(v).length > 0, "No fields to update");

  try {
    const ctx = await requireAuth(req);
    const body = schema.parse(req.body);
    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(
      ctx.userId, 
      body, 
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ 
      message: "Business settings updated successfully",
      user: {
        id: user._id.toString(),
        businessName: user.businessName,
        companyPhone: user.companyPhone,
        companyEmail: user.companyEmail,
        website: user.website,
        billingAddress: user.billingAddress,
        state: user.state,
        pincode: user.pincode,
        city: user.city,
        language: user.language,
        businessType: user.businessType,
        industryType: user.industryType,
        businessDescription: user.businessDescription,
        gstin: user.gstin,
        panNumber: user.panNumber,
        isGSTRegistered: user.isGSTRegistered,
        enableEInvoicing: user.enableEInvoicing,
        enableTDS: user.enableTDS,
        enableTCS: user.enableTCS,
        businessLogo: user.businessLogo,
        signature: user.signature,
        currencyCode: user.currencyCode,
        currencySymbol: user.currencySymbol,
      }
    });
  } catch (err: unknown) {
    console.error('Error updating business settings:', err);
    const msg = err instanceof Error ? err.message : "Unable to update business settings";
    const status = msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

// Profile image upload (Database Storage)
router.post("/upload/profile-image", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    await connectToDatabase();

    // Import multer for file processing
    const multer = require('multer');
    
    // Configure multer to use memory storage
    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
      fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
      }
    });

    // Process the upload
    upload.single("image")(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      try {
        // Import image storage utilities
        const { storeImageInDatabase } = await import("../lib/imageStorage");
        
        // Store image in database as base64
        const imageDataUrl = await storeImageInDatabase(req.file.buffer, req.file.mimetype);

        // Update user's profileImage field
        const user = await UserModel.findByIdAndUpdate(
          ctx.userId,
          { profileImage: imageDataUrl },
          { new: true }
        );

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        return res.json({ 
          message: "Profile image uploaded successfully",
          imageUrl: user.profileImage,
          success: true
        });
      } catch (storageError: any) {
        return res.status(400).json({ error: storageError.message });
      }
    });

  } catch (err: unknown) {
    console.error('Error uploading profile image:', err);
    const msg = err instanceof Error ? err.message : "Unable to upload profile image";
    const status = msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

// Clear profile image
router.post("/profile/clear-image", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(
      ctx.userId,
      { $unset: { profileImage: "" } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ 
      message: "Profile image cleared successfully",
      success: true
    });
  } catch (err: unknown) {
    console.error('Error clearing profile image:', err);
    const msg = err instanceof Error ? err.message : "Unable to clear profile image";
    const status = msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

// KYC submission
router.put("/kyc", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    const body = z.object({
      fullName: z.string().min(1),
      fatherName: z.string().optional(),
      address: z.string().min(1),
      dob: z.string().transform(val => new Date(val)),
      occupation: z.string().min(1),
      incomeSlab: z.string().min(1),
      profileImage: z.string().optional(),
      panNumber: z.string().min(10),
      panDocument: z.string().optional(),
      aadhaarNumber: z.string().min(12),
      aadhaarDocument: z.string().optional(),
      bankAccountName: z.string().min(1),
      bankAccountNumber: z.string().min(1),
      bankName: z.string().min(1),
      bankAddress: z.string().min(1),
      bankIfsc: z.string().min(11),
      bankDocument: z.string().optional(),
      nominees: z.array(z.object({
        relation: z.string().min(1),
        name: z.string().min(1),
        dob: z.string().transform(val => new Date(val)),
        mobile: z.string().min(10)
      })).optional()
    }).parse(req.body);

    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(
      ctx.userId,
      {
        $set: {
          ...body,
          kycStatus: "submitted",
          kycSubmittedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ message: "KYC submitted successfully", user });
  } catch (err: unknown) {
    console.error('Error submitting KYC:', err);
    const msg = err instanceof Error ? err.message : "Unable to submit KYC information";
    const status = msg.includes("permission") || msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

export default router;
