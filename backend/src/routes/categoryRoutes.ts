import { Router } from "express";
import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/models/Category";

const router = Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    await connectToDatabase();
    const showInactive = Boolean(req.query.showInactive);
    
    const filter = showInactive ? {} : { isActive: true };
    const categories = await CategoryModel.find(filter).sort({ name: 1 }).lean();
    
    const formatted = categories.map((cat) => ({
      _id: cat._id?.toString() || '',
      name: cat.name,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return res.json({ categories: formatted });
  } catch (err: unknown) {
    console.error('Error fetching categories:', err);
    const msg = err instanceof Error ? err.message : "Unable to load categories";
    return res.status(500).json({ error: msg });
  }
});

export default router;
