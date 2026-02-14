import { Router } from "express";
import { connectToDatabase } from "@/lib/db";
import { Slider } from "@/models/Slider";

const router = Router();

// Get active sliders for public display
router.get("/", async (req, res) => {
  try {
    await connectToDatabase();
    const sliders = await Slider.find({ isActive: true })
      .sort({ order: 1 })
      .select('title description imageUrl order')
      .lean();
    return res.json({ sliders });
  } catch (err: unknown) {
    console.error('Error fetching sliders:', err);
    const msg = err instanceof Error ? err.message : "Unable to load slider images";
    return res.status(500).json({ error: msg });
  }
});

export default router;
