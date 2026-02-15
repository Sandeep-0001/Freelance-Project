import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { distributeBusinessVolumeWithSession } from "@/lib/bvDistribution";
import { PurchaseModel } from "@/models/Purchase";
import { ServiceModel } from "@/models/Service";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// Get user purchases
router.get("/", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    await connectToDatabase();

    const purchases = await PurchaseModel.find({ user: ctx.userId }).populate("service").sort({ createdAt: -1 }).limit(50);
    return res.json({ purchases });
  } catch (err: unknown) {
    console.error('Error fetching purchases:', err);
    const msg = err instanceof Error ? err.message : "Unable to load purchase history";
    const status = msg.includes("permission") || msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

// Create purchase
router.post("/", async (req, res) => {
  const schema = z.object({ 
    serviceId: z.string().min(1),
    idempotencyKey: z.string().optional()
  });

  try {
    const ctx = await requireAuth(req);
    const body = schema.parse(req.body);
    await connectToDatabase();

    // Check for idempotent request
    if (body.idempotencyKey) {
      const existing = await PurchaseModel.findOne({ 
        idempotencyKey: body.idempotencyKey,
        user: ctx.userId 
      });
      if (existing) {
        return res.status(200).json({ 
          ok: true, 
          purchaseId: existing._id.toString(),
          bv: existing.bv,
          cached: true,
          status: existing.status
        });
      }
    }

    // Validate service exists and is active
    const service = await ServiceModel.findById(body.serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    
    const legacyService = service as unknown as { isActive?: boolean };
    const status = service.status ?? (legacyService.isActive ? "active" : "inactive");
    if (status !== "active") {
      return res.status(400).json({ error: "Service is not available for purchase" });
    }

    // Check for duplicate recent purchases (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentPurchase = await PurchaseModel.findOne({
      user: ctx.userId,
      service: body.serviceId,
      createdAt: { $gte: fiveMinutesAgo },
      status: { $in: ["pending", "completed"] }
    });
    
    if (recentPurchase) {
      return res.status(409).json({ 
        error: "You have recently purchased this service. Please wait before purchasing again.",
        existingPurchaseId: recentPurchase._id.toString()
      });
    }

    const session = await mongoose.startSession();
    let purchaseId: string | null = null;

    try {
      const result = await session.withTransaction(async () => {
        const [purchase] = await PurchaseModel.create(
          [
            {
              user: new mongoose.Types.ObjectId(ctx.userId),
              service: body.serviceId,
              bv: 0,
              status: "pending",
              idempotencyKey: body.idempotencyKey,
            },
          ],
          { session }
        );

        purchaseId = purchase._id.toString();

        const distribution = await distributeBusinessVolumeWithSession({
          userId: ctx.userId,
          serviceId: body.serviceId,
          purchaseId: purchase._id.toString(),
          session,
        });

        await PurchaseModel.updateOne(
          { _id: purchase._id }, 
          { 
            $set: { 
              bv: distribution.bv,
              status: "completed" 
            } 
          }, 
          { session }
        );

        console.log(`[Purchase] User ${ctx.userId} purchased service ${body.serviceId}, BV: ${distribution.bv}, Levels paid: ${distribution.levelsPaid}`);

        return {
          purchaseId: purchase._id.toString(),
          bv: distribution.bv,
          logsCreated: distribution.logsCreated,
          levelsPaid: distribution.levelsPaid,
        };
      });

      return res.status(201).json({ ok: true, ...result });
    } catch (txError: unknown) {
      // Mark purchase as failed if it was created
      if (purchaseId) {
        try {
          await PurchaseModel.updateOne(
            { _id: new mongoose.Types.ObjectId(purchaseId) },
            { 
              $set: { 
                status: "failed",
                failureReason: txError instanceof Error ? txError.message : "Transaction failed"
              } 
            }
          );
        } catch (updateErr) {
          console.error("Failed to update purchase status:", updateErr);
        }
      }
      throw txError;
    } finally {
      session.endSession();
    }
  } catch (err: unknown) {
    console.error('Error creating purchase:', err);
    const msg = err instanceof Error ? err.message : "Unable to create purchase";
    const status = msg.includes("permission") || msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

export default router;
