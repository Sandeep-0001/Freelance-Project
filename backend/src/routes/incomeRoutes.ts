import { Router } from "express";
import { connectToDatabase } from "@/lib/db";
import { IncomeModel } from "@/models/Income";
import { UserModel } from "@/models/User";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// Get income statistics (aggregated summary)
router.get("/stats", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    await connectToDatabase();

    // Get total income from User model (most efficient)
    const user = await UserModel.findById(ctx.userId).select("totalIncome totalBV");
    
    // Get income breakdown by level
    const incomeByLevel = await IncomeModel.aggregate([
      { $match: { toUser: ctx.userId } },
      {
        $group: {
          _id: "$level",
          totalAmount: { $sum: "$amount" },
          totalBV: { $sum: "$bv" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent income count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentIncomeCount = await IncomeModel.countDocuments({
      toUser: ctx.userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    return res.json({
      totalIncome: user?.totalIncome ?? 0,
      totalBV: user?.totalBV ?? 0,
      incomeByLevel: incomeByLevel.map(item => ({
        level: item._id,
        amount: item.totalAmount,
        bv: item.totalBV,
        count: item.count
      })),
      recentIncomeCount,
    });
  } catch (err: unknown) {
    console.error('Error fetching income stats:', err);
    const msg = err instanceof Error ? err.message : "Unable to load income statistics";
    const status = msg.includes("permission") || msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

// Get user income
router.get("/", async (req, res) => {
  try {
    const ctx = await requireAuth(req);
    await connectToDatabase();

    const incomes = await IncomeModel.find({ toUser: ctx.userId })
      .populate("fromUser", "email referralCode")
      .populate("purchase")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ incomes });
  } catch (err: unknown) {
    console.error('Error fetching income:', err);
    const msg = err instanceof Error ? err.message : "Unable to load income information";
    const status = msg.includes("permission") || msg.includes("log in") || msg.includes("Authentication") ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
});

export default router;
