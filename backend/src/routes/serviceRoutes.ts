import { Router } from "express";
import { connectToDatabase } from "@/lib/db";
import { ServiceModel } from "@/models/Service";

const router = Router();

// Get all public services
router.get("/", async (_req, res) => {
  try {
    await connectToDatabase();
    const services = await ServiceModel.find({ status: "active" }).sort({ createdAt: -1 }).lean();
    
    // Ensure all services have required fields for frontend compatibility
    const processedServices = services.map(service => ({
      _id: service._id?.toString() || '',
      name: service.name || '',
      slug: service.slug || service.name?.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-') || '',
      image: service.image || '/images/default-service.jpg',
      price: service.price || 0,
      businessVolume: service.businessVolume || 0,
      status: service.status || 'active',
      ...(service.originalPrice && { originalPrice: service.originalPrice }),
      ...(service.currency && { currency: service.currency }),
      ...(service.discountPercent && { discountPercent: service.discountPercent }),
      ...(service.shortDescription && { shortDescription: service.shortDescription }),
      ...(service.description && { description: service.description }),
      ...(service.isFeatured !== undefined && { isFeatured: service.isFeatured }),
      ...(service.categoryId && { categoryId: service.categoryId }),
      ...(service.tags && { tags: service.tags }),
      ...(service.rating && { rating: service.rating }),
      ...(service.reviewCount && { reviewCount: service.reviewCount }),
      ...(service.gallery && { gallery: service.gallery }),
    }));
    
    res.json({ services: processedServices });
  } catch (err: unknown) {
    console.error('Error fetching services:', err);
    const msg = err instanceof Error ? err.message : "Unable to load services. Please try again.";
    res.status(500).json({ error: msg, services: [] });
  }
});

export default router;
