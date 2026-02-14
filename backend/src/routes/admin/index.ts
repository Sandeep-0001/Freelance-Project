import type { Express, Request, Response } from "express";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generateUniqueReferralCode } from "@/lib/referral";
import { importUpload } from "@/lib/upload";
import { processBulkServiceUpload, generateServiceImportTemplate } from "@/lib/bulkServiceImport";
import { processBulkCategoryUpload, generateCategoryImportTemplate } from "@/lib/bulkCategoryImport";
import { requireAuth, requireRole, requireAdminRole, requireSuperAdminOrAdmin } from "@/middleware/auth";

import { UserModel } from "@/models/User";
import { ServiceModel } from "@/models/Service";
import { CategoryModel } from "@/models/Category";
import { SubcategoryModel } from "@/models/Subcategory";
import { PurchaseModel } from "@/models/Purchase";
import { IncomeLogModel } from "@/models/IncomeLog";
import { DistributionRuleModel } from "@/models/DistributionRule";
import { ContactModel } from "@/models/Contact";
import { Slider } from "@/models/Slider";

/**
 * Register all admin routes
 * These routes are protected and require admin, super_admin, or moderator roles
 */
export function registerAdminRoutes(app: Express) {
  // ============================================================================
  // ADMIN DASHBOARD
  // ============================================================================
  
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const [totalUsers, activeServices] = await Promise.all([
        UserModel.estimatedDocumentCount(),
        ServiceModel.countDocuments({ $or: [{ status: "active" }, { status: { $exists: false }, isActive: true }] }),
      ]);

      const bvAgg = await PurchaseModel.aggregate<{ _id: null; totalBVGenerated: number }>([
        { $group: { _id: null, totalBVGenerated: { $sum: { $ifNull: ["$bv", 0] } } } },
      ]);
      const totalBVGenerated = bvAgg[0]?.totalBVGenerated ?? 0;

      const incomeAgg = await IncomeLogModel.aggregate<{ _id: null; totalIncomeDistributed: number }>([
        { $group: { _id: null, totalIncomeDistributed: { $sum: { $ifNull: ["$incomeAmount", 0] } } } },
      ]);
      const totalIncomeDistributed = incomeAgg[0]?.totalIncomeDistributed ?? 0;

      return res.json({ totalUsers, totalBVGenerated, totalIncomeDistributed, activeServices });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Forbidden";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // ADMIN ANALYTICS
  // ============================================================================
  
  app.get("/api/admin/analytics", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // User Analytics
      const totalUsers = await UserModel.countDocuments({ status: { $ne: "deleted" } });
      const activeUsers = await UserModel.countDocuments({ status: { $ne: "deleted" }, activityStatus: "active" });
      
      // Provider Analytics (role: "user" = service providers in this system)
      const totalProviders = await UserModel.countDocuments({ status: { $ne: "deleted" }, role: "user" });
      const activeProviders = await UserModel.countDocuments({ status: { $ne: "deleted" }, activityStatus: "active", role: "user" });
      const newProviders = await UserModel.countDocuments({
        createdAt: { $gte: startOfMonth },
        status: { $ne: "deleted" },
        role: "user"
      });
      
      // Buyer Analytics (roles: "admin", "moderator" = buyers in this system)
      const totalBuyers = await UserModel.countDocuments({ 
        status: { $ne: "deleted" }, 
        role: { $in: ["admin", "moderator"] }
      });
      const activeBuyers = await UserModel.countDocuments({ 
        status: { $ne: "deleted" }, 
        activityStatus: "active",
        role: { $in: ["admin", "moderator"] }
      });
      const newBuyers = await UserModel.countDocuments({
        createdAt: { $gte: startOfMonth },
        status: { $ne: "deleted" },
        role: { $in: ["admin", "moderator"] }
      });
      
      const newRegistrations = await UserModel.countDocuments({
        createdAt: { $gte: startOfMonth },
        status: { $ne: "deleted" }
      });

      // Service Analytics
      const totalServices = await ServiceModel.countDocuments();
      const pendingServices = await ServiceModel.countDocuments({ status: "pending_approval" });
      const approvedServices = await ServiceModel.countDocuments({ status: "approved" });
      const rejectedServices = await ServiceModel.countDocuments({ status: "rejected" });
      const activeServices = await ServiceModel.countDocuments({ status: "active" });

      // Inquiry Analytics (using Contact model as inquiries)
      const totalInquiries = await ContactModel.countDocuments();
      const pendingInquiries = await ContactModel.countDocuments({ status: "pending" });

      return res.json({
        users: {
          total: totalUsers,
          active: activeUsers,
          providers: {
            total: totalProviders,
            active: activeProviders,
            new: newProviders
          },
          buyers: {
            total: totalBuyers,
            active: activeBuyers,
            new: newBuyers
          },
          newRegistrations
        },
        services: {
          total: totalServices,
          pending: pendingServices,
          approved: approvedServices,
          rejected: rejectedServices,
          active: activeServices
        },
        inquiries: {
          total: totalInquiries,
          pending: pendingInquiries
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================
  
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      const role = req.query.role as string;
      const status = req.query.status as string;

      const today = new Date();
      const query: any = { status: { $ne: "deleted" } };
      
      // Handle special "new" filter for users created this month
      if (status === "new") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        query.createdAt = { $gte: startOfMonth };
      } else if (status === "active" || status === "inactive") {
        // Filter by activity status for active/inactive
        query.activityStatus = status;
      } else if (status) {
        // Filter by account status for other values (suspended, etc.)
        query.status = status;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } }
        ];
      }
      if (role) query.role = role;

      const users = await UserModel.find(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("parent", "name email mobile");

      const total = await UserModel.countDocuments(query);

      return res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.get("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      const user = await UserModel.findById(req.params.id)
        .select("-passwordHash")
        .populate("parent", "name email mobile");

      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.post("/api/admin/users", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      const body = z.object({
        name: z.string().min(1),
        email: z.string().email({ message: "Invalid email format" }).optional(),
        mobile: z.string().min(10),
        countryCode: z.string().default("+91"),
        password: z.string().min(8),
        role: z.enum(["super_admin", "admin", "moderator", "user"]),
        referralCode: z.string().optional()
      }).parse(req.body);

      await connectToDatabase();

      // Check if user already exists
      const existingUser = await UserModel.findOne({
        $or: [
          { mobile: body.mobile },
          { email: body.email }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ error: "User with this mobile or email already exists" });
      }

      const passwordHash = await hashPassword(body.password);
      const referralCode = body.referralCode || await generateUniqueReferralCode();

      const user = new UserModel({
        ...body,
        passwordHash,
        referralCode,
        fullName: body.name,
        isVerified: true
      });

      await user.save();

      return res.status(201).json({
        message: "User created successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/users/:id/status", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      const body = z.object({
        status: z.enum(["active", "suspended", "deleted"])
      }).parse(req.body);

      await connectToDatabase();

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { $set: { status: body.status } },
        { new: true, runValidators: true }
      ).select("-passwordHash");

      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({ message: "User status updated successfully", user });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      await connectToDatabase();

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { $set: { status: "deleted" } },
        { new: true }
      );

      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({ message: "User deleted successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // SERVICE MANAGEMENT
  // ============================================================================
  
  app.get("/api/admin/services", async (req, res) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();
      const services = await ServiceModel.find({}).sort({ createdAt: -1 });
      return res.json({ services });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Forbidden";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.post("/api/admin/services", async (req, res) => {
    const schema = z.object({
      name: z.string().min(1),
      slug: z.string().min(1).optional(),
      image: z.string().url({ message: "Invalid URL format" }).optional(),
      gallery: z.array(z.string().url({ message: "Invalid URL format" })).optional(),
      price: z.number().min(0),
      originalPrice: z.number().min(0).optional(),
      currency: z.enum(["INR", "USD"]).default("INR"),
      discountPercent: z.number().min(0).max(100).optional(),
      businessVolume: z.number().min(0),
      shortDescription: z.string().max(200).optional(),
      description: z.string().optional(),
      status: z.enum(["active", "inactive", "out_of_stock"]).default("active"),
      isFeatured: z.boolean().default(false),
      categoryId: z.string().optional(),
      tags: z.array(z.string()).optional(),
    });

    try {
      await requireRole(req, "admin");
      const body = schema.parse(req.body);
      await connectToDatabase();

      // Auto-generate slug if not provided
      const slug = body.slug || body.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');
      
      // Use default image if not provided
      const image = body.image || '/images/default-service.jpg';

      // Check for duplicate slug
      const existingService = await ServiceModel.findOne({ slug });
      if (existingService) {
        return res.status(400).json({ error: `Service with slug "${slug}" already exists` });
      }

      const service = await ServiceModel.create({
        name: body.name,
        slug,
        image,
        gallery: body.gallery,
        price: body.price,
        originalPrice: body.originalPrice,
        currency: body.currency,
        discountPercent: body.discountPercent,
        businessVolume: body.businessVolume,
        shortDescription: body.shortDescription,
        description: body.description,
        status: body.status,
        isFeatured: body.isFeatured,
        categoryId: body.categoryId,
        tags: body.tags,
      });

      return res.status(201).json({ service });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/services/:id", async (req, res) => {
    const schema = z
      .object({
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        image: z.string().url({ message: "Invalid URL format" }).optional(),
        gallery: z.array(z.string().url({ message: "Invalid URL format" })).optional(),
        price: z.number().min(0).optional(),
        originalPrice: z.number().min(0).optional(),
        currency: z.enum(["INR", "USD"]).optional(),
        discountPercent: z.number().min(0).max(100).optional(),
        businessVolume: z.number().min(0).optional(),
        shortDescription: z.string().max(200).optional(),
        description: z.string().optional(),
        status: z.enum(["active", "inactive", "out_of_stock"]).optional(),
        isFeatured: z.boolean().optional(),
        categoryId: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
      .refine((v) => Object.keys(v).length > 0, "No fields to update");

    try {
      await requireRole(req, "admin");
      const body = schema.parse(req.body);
      await connectToDatabase();

      const service = await ServiceModel.findByIdAndUpdate(req.params.id, body, { new: true });
      if (!service) return res.status(404).json({ error: "Not found" });
      return res.json({ service });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.delete("/api/admin/services/:id", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      await connectToDatabase();

      const service = await ServiceModel.findByIdAndDelete(req.params.id);
      if (!service) return res.status(404).json({ error: "Service not found" });

      return res.json({ message: "Service deleted successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // Bulk Service Import/Export
  app.post("/api/admin/services/bulk-upload", importUpload.single("file"), async (req, res) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const fs = await import("node:fs").then(m => m.promises);
      const fileBuffer = await fs.readFile(req.file.path);

      const result = await processBulkServiceUpload(fileBuffer, req.file.originalname, ServiceModel);

      await fs.unlink(req.file.path).catch(() => {});

      if (!result.success && result.errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Import failed with ${result.errors.length} error(s)`,
          totalRows: result.totalRows,
          successfulInserts: result.successfulInserts,
          errors: result.errors.slice(0, 10),
          warnings: result.warnings,
          summary: result.summary,
        });
      }

      return res.status(201).json({
        success: true,
        message: `Successfully imported ${result.successfulInserts} services`,
        totalRows: result.totalRows,
        successfulInserts: result.successfulInserts,
        errors: result.errors,
        warnings: result.warnings,
        summary: result.summary,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error";
      const status = msg === "Forbidden" ? 403 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  app.get("/api/admin/services/template/download", async (req, res) => {
    try {
      await requireAdminRole(req);

      const template = generateServiceImportTemplate();

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="service-import-template.xlsx"');
      res.send(template);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error";
      const status = msg === "Forbidden" ? 403 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  app.post("/api/admin/services/bulk", async (req, res) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const { services, format } = req.body;

      if (!services || !Array.isArray(services)) {
        return res.status(400).json({ error: "Services array is required" });
      }

      if (!format || !['json', 'excel', 'csv'].includes(format)) {
        return res.status(400).json({ error: "Format must be json, excel, or csv" });
      }

      const processedServices = services.map(service => ({
        ...service,
        slug: service.slug || service.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
        status: service.status || "active",
        currency: service.currency || "INR",
        isActive: service.isActive === undefined ? true : service.isActive,
        categoryId: service.categoryId || null,
      }));

      const result = await ServiceModel.insertMany(processedServices);

      const categoryGroups = processedServices.reduce((acc, service) => {
        const categoryId = service.categoryId || 'uncategorized';
        if (!acc[categoryId]) acc[categoryId] = [];
        acc[categoryId].push(service);
        return acc;
      }, {} as Record<string, any[]>);

      for (const [categoryId, categoryServices] of Object.entries(categoryGroups)) {
        if (categoryId !== 'uncategorized') {
          await CategoryModel.findByIdAndUpdate(categoryId, {
            $inc: { serviceCount: (categoryServices as any[]).length }
          });
        }
      }

      return res.status(201).json({ 
        message: `Successfully imported ${result.length} services`,
        services: result,
        categoryGroups
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.get("/api/admin/services/by-category", async (req, res) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const { categoryId, sortBy = 'sortOrder', sortOrder = 'asc' } = req.query;

      let query: any = {};
      if (categoryId && categoryId !== 'all') {
        query.categoryId = categoryId;
      }

      let sortQuery: any = {};
      if (sortBy === 'name') {
        sortQuery.name = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'price') {
        sortQuery.price = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'businessVolume') {
        sortQuery.businessVolume = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'sortOrder') {
        sortQuery.sortOrder = sortOrder === 'desc' ? -1 : 1;
      } else {
        sortQuery.sortOrder = 1;
      }

      const services = await ServiceModel.find(query)
        .sort(sortQuery)
        .populate('categoryId', 'name code slug')
        .lean();

      return res.json({ services });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Forbidden";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.get("/api/admin/services/export", async (req, res) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const { format = 'json', categoryId, sortBy = 'sortOrder', sortOrder = 'asc' } = req.query;

      let query: any = {};
      if (categoryId && categoryId !== 'all') {
        query.categoryId = categoryId;
      }

      let sortQuery: any = {};
      if (sortBy === 'name') {
        sortQuery.name = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'price') {
        sortQuery.price = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'businessVolume') {
        sortQuery.businessVolume = sortOrder === 'desc' ? -1 : 1;
      } else {
        sortQuery.sortOrder = 1;
      }

      const services = await ServiceModel.find(query)
        .sort(sortQuery)
        .populate('categoryId', 'name code slug')
        .lean();

      if (format === 'csv') {
        const csv = [
          'Name,Slug,Category,Price,Business Volume,Status,Featured,Description',
          ...services.map(service => [
            service.name,
            service.slug,
            (service.categoryId as any)?.name || 'Uncategorized',
            service.price,
            service.businessVolume,
            service.status,
            service.isFeatured || false,
            `"${(service.description || '').replaceAll('"', '""')}"`
          ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="services.csv"`);
        return res.send(csv);
      } else if (format === 'excel') {
        const excelCsv = [
          'Name\tSlug\tCategory\tPrice\tBV\tStatus\tFeatured\tDescription',
          ...services.map(service => [
            service.name,
            service.slug,
            (service.categoryId as any)?.name || 'Uncategorized',
            service.price,
            service.businessVolume,
            service.status,
            service.isFeatured || false,
            service.description || ''
          ].join('\t'))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="services.xls"`);
        return res.send(excelCsv);
      } else {
        return res.json({ services });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Forbidden";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // SERVICE APPROVAL
  // ============================================================================
  
  app.get("/api/admin/services/pending", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;

      const services = await ServiceModel.find({ status: "pending_approval" })
        .populate("categoryId", "name code")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await ServiceModel.countDocuments({ status: "pending_approval" });

      return res.json({
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/services/:id/approve", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      const ctx = await requireAuth(req);

      const service = await ServiceModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status: "approved",
            approvedAt: new Date(),
            approvedBy: ctx.userId
          }
        },
        { new: true, runValidators: true }
      ).populate("categoryId", "name code");

      if (!service) return res.status(404).json({ error: "Service not found" });

      return res.json({ message: "Service approved successfully", service });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/services/:id/reject", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      const body = z.object({
        reason: z.string().min(1, "Rejection reason is required")
      }).parse(req.body);

      await connectToDatabase();

      const ctx = await requireAuth(req);

      const service = await ServiceModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status: "rejected",
            rejectedAt: new Date(),
            rejectedBy: ctx.userId,
            rejectionReason: body.reason
          }
        },
        { new: true, runValidators: true }
      ).populate("categoryId", "name code");

      if (!service) return res.status(404).json({ error: "Service not found" });

      return res.json({ message: "Service rejected successfully", service });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // CONTACT MANAGEMENT
  // ============================================================================
  
  app.get("/api/admin/contacts", async (req, res) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const contacts = await ContactModel.find({})
        .sort({ createdAt: -1 })
        .limit(50);

      return res.json({ contacts });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Forbidden";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/contacts/:id", async (req, res) => {
    const schema = z.object({
      status: z.enum(["pending", "read", "replied"]),
    });

    try {
      await requireRole(req, "admin");
      const body = schema.parse(req.body);
      await connectToDatabase();

      const contact = await ContactModel.findByIdAndUpdate(
        req.params.id, 
        { status: body.status }, 
        { new: true }
      );
      
      if (!contact) return res.status(404).json({ error: "Not found" });
      return res.json({ contact });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // SLIDER MANAGEMENT
  // ============================================================================
  
  app.get("/api/admin/sliders", async (req: Request, res: Response) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();
      const sliders = await Slider.find()
        .sort({ order: 1 })
        .lean();
      return res.json({ sliders });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  const sliderCreateSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    imageUrl: z.string().min(1),
    order: z.number().int().min(0),
    isActive: z.boolean().default(true)
  });

  app.post("/api/admin/sliders", async (req: Request, res: Response) => {
    try {
      await requireRole(req, "admin");
      const body = sliderCreateSchema.parse(req.body);
      await connectToDatabase();

      const slider = new Slider(body);
      await slider.save();
      return res.json({ slider });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  const sliderUpdateSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    imageUrl: z.string().min(1).optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional()
  });

  app.put("/api/admin/sliders/reorder", async (req: Request, res: Response) => {
    try {
      await requireRole(req, "admin");
      const reorderSchema = z.object({
        sliders: z.array(z.object({
          id: z.string().min(1),
          order: z.number().int().min(0)
        }))
      });
      const body = reorderSchema.parse(req.body);
      await connectToDatabase();

      const bulkOps = body.sliders.map(({ id, order }) => ({
        updateOne: {
          filter: { _id: id },
          update: { order }
        }
      }));

      await Slider.bulkWrite(bulkOps);
      return res.json({ message: "Sliders reordered successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/sliders/:id", async (req: Request, res: Response) => {
    try {
      await requireRole(req, "admin");
      const body = sliderUpdateSchema.parse(req.body);
      await connectToDatabase();

      const slider = await Slider.findByIdAndUpdate(
        req.params.id,
        { $set: body },
        { new: true, runValidators: true }
      );

      if (!slider) return res.status(404).json({ error: "Slider not found" });
      return res.json({ slider });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.delete("/api/admin/sliders/:id", async (req: Request, res: Response) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const slider = await Slider.findByIdAndDelete(req.params.id);
      if (!slider) return res.status(404).json({ error: "Slider not found" });
      
      return res.json({ message: "Slider deleted successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // CATEGORY MANAGEMENT
  // ============================================================================
  
  app.post("/api/admin/categories", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      const body = z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        code: z.string().min(1).max(10),
        icon: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().min(0).default(0)
      }).parse(req.body);

      await connectToDatabase();

      const category = new CategoryModel(body);
      await category.save();

      return res.status(201).json({ message: "Category created successfully", category });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/categories/:id", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      const body = z.object({
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).optional(),
        code: z.string().min(1).max(10).optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().min(0).optional()
      }).parse(req.body);

      await connectToDatabase();

      const category = await CategoryModel.findByIdAndUpdate(
        req.params.id,
        { $set: body },
        { new: true, runValidators: true }
      );

      if (!category) return res.status(404).json({ error: "Category not found" });

      return res.json({ message: "Category updated successfully", category });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.delete("/api/admin/categories/:id", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      await connectToDatabase();

      const category = await CategoryModel.findByIdAndDelete(req.params.id);
      if (!category) return res.status(404).json({ error: "Category not found" });

      return res.json({ message: "Category deleted successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // Bulk Category Import
  app.post("/api/admin/categories/bulk-upload", importUpload.single("file"), async (req, res) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const fs = await import("node:fs").then(m => m.promises);
      const fileBuffer = await fs.readFile(req.file.path);

      const result = await processBulkCategoryUpload(fileBuffer, req.file.originalname, CategoryModel);

      await fs.unlink(req.file.path).catch(() => {});

      if (!result.success && result.errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Import failed with ${result.errors.length} error(s)`,
          totalRows: result.totalRows,
          successfulInserts: result.successfulInserts,
          errors: result.errors.slice(0, 10),
          warnings: result.warnings,
          summary: result.summary,
        });
      }

      return res.status(201).json({
        success: true,
        message: `Successfully imported ${result.successfulInserts} categories`,
        totalRows: result.totalRows,
        successfulInserts: result.successfulInserts,
        errors: result.errors,
        warnings: result.warnings,
        summary: result.summary,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error";
      const status = msg === "Forbidden" ? 403 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  app.get("/api/admin/categories/template/download", async (req, res) => {
    try {
      await requireAdminRole(req);

      const template = generateCategoryImportTemplate();

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="category-import-template.xlsx"');
      res.send(template);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error";
      const status = msg === "Forbidden" ? 403 : 500;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // SUBCATEGORY MANAGEMENT
  // ============================================================================
  
  app.post("/api/admin/subcategories", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      const body = z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        code: z.string().min(1).max(10),
        categoryId: z.string(),
        icon: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().min(0).default(0)
      }).parse(req.body);

      await connectToDatabase();

      const subcategory = new SubcategoryModel(body);
      await subcategory.save();

      return res.status(201).json({ message: "Subcategory created successfully", subcategory });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.get("/api/admin/subcategories", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      const categoryId = req.query.categoryId as string;
      const query: any = {};
      if (categoryId) query.categoryId = categoryId;

      const subcategories = await SubcategoryModel.find(query)
        .populate("categoryId", "name code")
        .sort({ sortOrder: 1, name: 1 });

      return res.json({ subcategories });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // DISTRIBUTION RULES
  // ============================================================================
  
  app.get("/api/admin/rules", async (req, res) => {
    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const activeRule = await DistributionRuleModel.findOne({ isActive: true }).sort({ createdAt: -1 });
      const recentRules = await DistributionRuleModel.find({}).sort({ createdAt: -1 }).limit(10);

      return res.json({ activeRule, recentRules });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Forbidden";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.post("/api/admin/rules", async (req, res) => {
    const schema = z.object({
      basePercentage: z
        .number()
        .min(0)
        .transform((v) => (v > 1 ? v / 100 : v))
        .refine((v) => v >= 0 && v <= 1, "basePercentage must be between 0 and 1"),
      decayEnabled: z.boolean(),
      isActive: z.boolean().optional(),
    });

    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const body = schema.parse(req.body);
      const isActive = body.isActive ?? true;
      if (isActive) await DistributionRuleModel.updateMany({ isActive: true }, { $set: { isActive: false } });

      const rule = await DistributionRuleModel.create({
        basePercentage: body.basePercentage,
        decayEnabled: body.decayEnabled,
        isActive,
      });

      return res.status(201).json({ rule });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/rules/:id", async (req, res) => {
    const schema = z
      .object({
        basePercentage: z
          .number()
          .min(0)
          .optional()
          .transform((v) => {
            if (v == null) return v;
            return v > 1 ? v / 100 : v;
          })
          .refine((v) => v == null || (v >= 0 && v <= 1), "basePercentage must be between 0 and 1"),
        decayEnabled: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
      .refine((v) => Object.keys(v).length > 0, "No fields to update");

    try {
      await requireRole(req, "admin");
      await connectToDatabase();

      const body = schema.parse(req.body);
      if (body.isActive === true) await DistributionRuleModel.updateMany({ isActive: true }, { $set: { isActive: false } });

      const rule = await DistributionRuleModel.findByIdAndUpdate(req.params.id, body, { new: true });
      if (!rule) return res.status(404).json({ error: "Not found" });

      return res.json({ rule });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // PAYMENT SETTINGS
  // ============================================================================
  
  app.get("/api/admin/payment-settings", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      await connectToDatabase();

      const adminUser = await UserModel.findOne({ role: { $in: ["admin", "super_admin"] } })
        .select("paymentLinkEnabled upiLink");

      const settings = {
        paymentLinkEnabled: adminUser?.paymentLinkEnabled || false,
        upiLink: adminUser?.upiLink || ""
      };

      return res.json(settings);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/payment-settings", async (req: Request, res: Response) => {
    try {
      await requireSuperAdminOrAdmin(req);
      const body = z.object({
        paymentLinkEnabled: z.boolean(),
        upiLink: z.string().optional()
      }).parse(req.body);

      await connectToDatabase();

      const updated = await UserModel.updateMany(
        { role: { $in: ["admin", "super_admin"] } },
        { $set: body }
      );

      return res.json({ message: "Payment settings updated successfully", updated });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  // ============================================================================
  // KYC MANAGEMENT
  // ============================================================================
  
  app.get("/api/admin/kyc/pending", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;

      const users = await UserModel.find({ kycStatus: "submitted" })
        .select("-passwordHash")
        .sort({ kycSubmittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await UserModel.countDocuments({ kycStatus: "submitted" });

      return res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/kyc/:id/approve", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      await connectToDatabase();

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            kycStatus: "verified",
            kycVerifiedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      ).select("-passwordHash");

      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({ message: "KYC approved successfully", user });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });

  app.put("/api/admin/kyc/:id/reject", async (req: Request, res: Response) => {
    try {
      await requireAdminRole(req);
      const body = z.object({
        reason: z.string().min(1, "Rejection reason is required")
      }).parse(req.body);

      await connectToDatabase();

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            kycStatus: "rejected",
            kycRejectedAt: new Date(),
            kycRejectionReason: body.reason
          }
        },
        { new: true, runValidators: true }
      ).select("-passwordHash");

      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({ message: "KYC rejected successfully", user });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bad request";
      const status = msg === "Forbidden" ? 403 : 400;
      return res.status(status).json({ error: msg });
    }
  });
}
