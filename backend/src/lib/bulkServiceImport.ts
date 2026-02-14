import XLSX from "xlsx";
import { z } from "zod";
import type { Service } from "@/models/Service";
import { CategoryModel } from "@/models/Category";

/**
 * Schema for validating individual service rows from Excel/CSV
 */
const ServiceRowSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  slug: z.string().min(1, "Slug is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  originalPrice: z.coerce.number().min(0, "Original price must be >= 0").optional(),
  currency: z.enum(["INR", "USD"]).default("INR"),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  businessVolume: z.coerce.number().min(0, "Business volume must be >= 0"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "out_of_stock"]).default("active"),
  isFeatured: z.union([
    z.boolean().transform(v => v),
    z.string().transform(v => ["true", "TRUE", "True", "1"].includes(v))
  ])
    .optional()
    .default(() => false),
  categoryCode: z.string().optional(), // Will be matched to categoryId
  tags: z.string().optional(), // Comma-separated tags - will be parsed
  image: z.string().min(1, "Image URL is required"),
  gallery: z.string().optional(), // Comma-separated image URLs - will be parsed
});

export type ServiceRow = z.infer<typeof ServiceRowSchema>;

export interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successfulInserts: number;
  errors: {
    rowNumber: number;
    data: unknown;
    errors: string[];
  }[];
  warnings: {
    rowNumber: number;
    message: string;
  }[];
  summary: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

/**
 * Parse Excel/CSV file and extract service data
 */
export function parseServiceFile(
  buffer: Buffer,
  fileName: string
): {
  data: unknown[];
  error?: string;
} {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!worksheet) {
      return { data: [], error: "No data found in file" };
    }

    const data = XLSX.utils.sheet_to_json(worksheet);
    return { data };
  } catch (error) {
    return {
      data: [],
      error: `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function validateAndEnrichServices(
  rows: unknown[]
): Promise<{
  validatedServices: Array<Omit<ServiceRow, "gallery" | "tags"> & { categoryId?: string; gallery?: string[]; tags?: string[] }>;
  errors: { rowNumber: number; data: unknown; errors: string[] }[];
  warnings: { rowNumber: number; message: string }[];
}> {
  const validatedServices: Array<Omit<ServiceRow, "gallery" | "tags"> & { categoryId?: string; gallery?: string[]; tags?: string[] }> = [];
  const errors: { rowNumber: number; data: unknown; errors: string[] }[] = [];
  const warnings: { rowNumber: number; message: string }[] = [];

  // Cache categories to avoid repeated queries
  const categoryCache = new Map<string, string>();

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // Excel rows start at 1, header is row 1
    const row = rows[i];

    // Validate row structure
    const validation = ServiceRowSchema.safeParse(row);

    if (!validation.success) {
      const errorMessages = validation.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      errors.push({
        rowNumber,
        data: row,
        errors: errorMessages,
      });
      continue;
    }

    let categoryId: string | undefined;
    const categoryCode = (row as Record<string, unknown>).categoryCode as string | undefined;

    // Match category by code if provided
    if (categoryCode) {
      if (!categoryCache.has(categoryCode)) {
        const category = await CategoryModel.findOne({
          code: categoryCode.toUpperCase(),
        });

        if (!category) {
          warnings.push({
            rowNumber,
            message: `Category code "${categoryCode}" not found. Service will be created without category.`,
          });
          categoryCache.set(categoryCode, "NOT_FOUND");
        } else {
          categoryCache.set(categoryCode, category._id.toString());
        }
      }

      const cachedId = categoryCache.get(categoryCode);
      if (cachedId && cachedId !== "NOT_FOUND") {
        categoryId = cachedId;
      }
    }

    // Parse gallery images
    const gallery = validation.data.gallery
      ?.split(",")
      .map((img) => img.trim())
      .filter(Boolean) as string[] | undefined;

    // Parse tags
    const tags = validation.data.tags
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean) as string[] | undefined;

    validatedServices.push({
      ...validation.data,
      categoryId,
      gallery: gallery?.length ? gallery : undefined,
      tags: tags?.length ? tags : undefined,
    });
  }

  return { validatedServices, errors, warnings };
}

/**
 * Bulk insert services into database
 */
export async function bulkInsertServices(
  services: Array<Omit<ServiceRow, "gallery" | "tags"> & { categoryId?: string; gallery?: string[]; tags?: string[] }>,
  ServiceModel: any
): Promise<{
  inserted: number;
  failed: number;
  errors: { service: any; error: string }[];
  summary: { byCategory: Record<string, number>; byStatus: Record<string, number> };
}> {
  const insertedServices = [];
  const failedServices = [];
  const failureDetails: { service: any; error: string }[] = [];

  const summary = {
    byCategory: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };

  for (const service of services) {
    try {
      // Check for duplicate slug
      const existingService = await ServiceModel.findOne({ slug: service.slug });
      if (existingService) {
        throw new Error(`Service with slug "${service.slug}" already exists`);
      }

      const newService = new ServiceModel({
        ...service,
        rating: 0,
        reviewCount: 0,
      });

      await newService.save();
      insertedServices.push(newService);

      // Update summary
      const category = service.categoryId || "Uncategorized";
      summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;

      const status = service.status || "active";
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
    } catch (error) {
      failedServices.push(service);
      failureDetails.push({
        service,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    inserted: insertedServices.length,
    failed: failedServices.length,
    errors: failureDetails,
    summary,
  };
}

/**
 * Process bulk service upload
 */
export async function processBulkServiceUpload(
  buffer: Buffer,
  fileName: string,
  ServiceModel: any
): Promise<BulkUploadResult> {
  // Parse file
  const { data, error: parseError } = parseServiceFile(buffer, fileName);

  if (parseError) {
    return {
      success: false,
      totalRows: 0,
      successfulInserts: 0,
      errors: [],
      warnings: [],
      summary: { byCategory: {}, byStatus: {} },
    };
  }

  if (data.length === 0) {
    return {
      success: false,
      totalRows: 0,
      successfulInserts: 0,
      errors: [],
      warnings: [{ rowNumber: 1, message: "File is empty" }],
      summary: { byCategory: {}, byStatus: {} },
    };
  }

  // Validate and enrich
  const { validatedServices, errors, warnings } = await validateAndEnrichServices(data);

  // Bulk insert
  const { inserted, errors: insertErrors, summary } = await bulkInsertServices(
    validatedServices,
    ServiceModel
  );

  return {
    success: errors.length === 0 && insertErrors.length === 0,
    totalRows: data.length,
    successfulInserts: inserted,
    errors: [...errors, ...insertErrors.map((e) => ({ rowNumber: 0, data: e.service, errors: [e.error] }))],
    warnings,
    summary,
  };
}

/**
 * Generate sample Excel template for service import
 */
export function generateServiceImportTemplate(): Buffer {
  const sampleData = [
    {
      name: "Accounting Service",
      slug: "accounting-service",
      image: "https://example.com/accounting.jpg",
      gallery: "https://example.com/img1.jpg,https://example.com/img2.jpg",
      price: 4999,
      originalPrice: 6999,
      currency: "INR",
      discountPercent: 29,
      businessVolume: 50,
      shortDescription: "Basic accounting service",
      description: "Comprehensive cloud-based accounting solution",
      status: "active",
      isFeatured: "true",
      categoryCode: "FIN",
      tags: "accounting,finance,cloud",
    },
    {
      name: "GST Filing",
      slug: "gst-filing",
      image: "https://example.com/gst.jpg",
      gallery: "",
      price: 2499,
      originalPrice: 3499,
      currency: "INR",
      discountPercent: 28,
      businessVolume: 30,
      shortDescription: "Monthly GST filing",
      description: "Hassle-free monthly GST filing",
      status: "active",
      isFeatured: "false",
      categoryCode: "TAX",
      tags: "gst,tax,compliance",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Services");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
