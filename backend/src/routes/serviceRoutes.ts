import { Router } from "express";
import { connectToDatabase } from "@/lib/db";
import { ServiceModel } from "@/models/Service";
import { CategoryModel } from "@/models/Category";
import { SubcategoryModel } from "@/models/Subcategory";

const router = Router();

// Get all public services with optional filtering
router.get("/", async (req, res) => {
  try {
    await connectToDatabase();
    
    // Build filter query
    const filter: Record<string, unknown> = { status: "active" };
    
    // Filter by category
    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }
    
    // Filter by subcategory
    if (req.query.subcategoryId) {
      filter.subcategoryId = req.query.subcategoryId;
    }
    
    // Filter by who added (admin or user)
    if (req.query.addedBy && (req.query.addedBy === "admin" || req.query.addedBy === "user")) {
      filter.addedBy = req.query.addedBy;
    }
    
    // Filter by featured
    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }
    
    const services = await ServiceModel.find(filter).sort({ createdAt: -1 }).lean();
    
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
      ...(service.subcategoryId && { subcategoryId: service.subcategoryId }),
      ...(service.addedBy && { addedBy: service.addedBy }),
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

// Get services by category slug
router.get("/category/:categorySlug", async (req, res) => {
  try {
    await connectToDatabase();
    
    const { categorySlug } = req.params;
    
    // Find category by slug
    const category = await CategoryModel.findOne({ slug: categorySlug, isActive: true }).lean();
    
    if (!category) {
      return res.status(404).json({ error: "Category not found", services: [] });
    }
    
    // Get services in this category
    const services = await ServiceModel.find({ 
      categoryId: category._id, 
      status: "active" 
    }).sort({ createdAt: -1 }).lean();
    
    const processedServices = services.map(service => ({
      _id: service._id?.toString() || '',
      name: service.name || '',
      slug: service.slug || '',
      image: service.image || '/images/default-service.jpg',
      price: service.price || 0,
      businessVolume: service.businessVolume || 0,
      status: service.status || 'active',
      categoryId: service.categoryId,
      subcategoryId: service.subcategoryId,
      addedBy: service.addedBy,
      shortDescription: service.shortDescription,
      isFeatured: service.isFeatured,
    }));
    
    res.json({ 
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        code: category.code,
      },
      services: processedServices 
    });
  } catch (err: unknown) {
    console.error('Error fetching services by category:', err);
    const msg = err instanceof Error ? err.message : "Unable to load services.";
    res.status(500).json({ error: msg, services: [] });
  }
});

// Get services by subcategory slug
router.get("/subcategory/:subcategorySlug", async (req, res) => {
  try {
    await connectToDatabase();
    
    const { subcategorySlug } = req.params;
    
    // Find subcategory by slug
    const subcategory = await SubcategoryModel.findOne({ slug: subcategorySlug, isActive: true }).lean();
    
    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found", services: [] });
    }
    
    // Get parent category (convert _id to string for matching)
    const categoryId = typeof subcategory.categoryId === 'string' ? subcategory.categoryId : String(subcategory.categoryId);
    const category = await CategoryModel.findById(categoryId).lean();
    
    // Get services in this subcategory
    const services = await ServiceModel.find({ 
      subcategoryId: subcategory._id, 
      status: "active" 
    }).sort({ createdAt: -1 }).lean();
    
    const processedServices = services.map(service => ({
      _id: service._id?.toString() || '',
      name: service.name || '',
      slug: service.slug || '',
      image: service.image || '/images/default-service.jpg',
      price: service.price || 0,
      businessVolume: service.businessVolume || 0,
      status: service.status || 'active',
      categoryId: service.categoryId,
      subcategoryId: service.subcategoryId,
      addedBy: service.addedBy,
      shortDescription: service.shortDescription,
      isFeatured: service.isFeatured,
    }));
    
    res.json({ 
      subcategory: {
        _id: subcategory._id,
        name: subcategory.name,
        slug: subcategory.slug,
        code: subcategory.code,
        categoryId: subcategory.categoryId,
      },
      category: category ? {
        _id: category._id,
        name: category.name,
        slug: category.slug,
      } : null,
      services: processedServices 
    });
  } catch (err: unknown) {
    console.error('Error fetching services by subcategory:', err);
    const msg = err instanceof Error ? err.message : "Unable to load services.";
    res.status(500).json({ error: msg, services: [] });
  }
});

export default router;
