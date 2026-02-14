import XLSX from "xlsx";
import { z } from "zod";
import type { Category } from "@/models/Category";

/**
 * Schema for validating individual category rows from Excel/CSV
 */
const CategoryRowSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  code: z.string().min(1, "Code is required (max 10 chars)").max(10),
  icon: z.string().optional(),
  image: z.string().optional(),
  isActive: z.enum(["true", "false", "TRUE", "FALSE", "True", "False", "1", "0"])
    .transform(v => ["true", "TRUE", "True", "1"].includes(v))
    .optional()
    .default(() => true),
  sortOrder: z.coerce.number().min(0).optional().default(0),
});

export type CategoryRow = z.infer<typeof CategoryRowSchema>;

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
    totalAdded: number;
    totalFailed: number;
  };
}

/**
 * Parse Excel/CSV file and extract category data
 */
export function parseCategoryFile(
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

/**
 * Validate category rows
 */
export async function validateCategories(
  rows: unknown[]
): Promise<{
  validatedCategories: CategoryRow[];
  errors: { rowNumber: number; data: unknown; errors: string[] }[];
  warnings: { rowNumber: number; message: string }[];
}> {
  const validatedCategories: CategoryRow[] = [];
  const errors: { rowNumber: number; data: unknown; errors: string[] }[] = [];
  const warnings: { rowNumber: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // Excel rows start at 1, header is row 1
    const row = rows[i];

    // Validate row structure
    const validation = CategoryRowSchema.safeParse(row);

    if (!validation.success) {
      const errorMessages = validation.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      errors.push({
        rowNumber,
        data: row,
        errors: errorMessages,
      });
      continue;
    }

    validatedCategories.push(validation.data);
  }

  return { validatedCategories, errors, warnings };
}

/**
 * Bulk insert categories into database
 */
export async function bulkInsertCategories(
  categories: CategoryRow[],
  CategoryModel: any
): Promise<{
  inserted: number;
  failed: number;
  errors: { category: any; error: string }[];
}> {
  const insertedCategories = [];
  const failedCategories = [];
  const failureDetails: { category: any; error: string }[] = [];

  for (const category of categories) {
    try {
      // Check for duplicate code
      const existingCode = await CategoryModel.findOne({ code: category.code.toUpperCase() });
      if (existingCode) {
        throw new Error(`Category with code "${category.code}" already exists`);
      }

      // Check for duplicate slug
      const existingSlug = await CategoryModel.findOne({ slug: category.slug.toLowerCase() });
      if (existingSlug) {
        throw new Error(`Category with slug "${category.slug}" already exists`);
      }

      const newCategory = new CategoryModel({
        ...category,
        code: category.code.toUpperCase(),
        slug: category.slug.toLowerCase(),
      });

      await newCategory.save();
      insertedCategories.push(newCategory);
    } catch (error) {
      failedCategories.push(category);
      failureDetails.push({
        category,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    inserted: insertedCategories.length,
    failed: failedCategories.length,
    errors: failureDetails,
  };
}

/**
 * Process bulk category upload
 */
export async function processBulkCategoryUpload(
  buffer: Buffer,
  fileName: string,
  CategoryModel: any
): Promise<BulkUploadResult> {
  // Parse file
  const { data, error: parseError } = parseCategoryFile(buffer, fileName);

  if (parseError) {
    return {
      success: false,
      totalRows: 0,
      successfulInserts: 0,
      errors: [],
      warnings: [],
      summary: { totalAdded: 0, totalFailed: 0 },
    };
  }

  if (data.length === 0) {
    return {
      success: false,
      totalRows: 0,
      successfulInserts: 0,
      errors: [],
      warnings: [{ rowNumber: 1, message: "File is empty" }],
      summary: { totalAdded: 0, totalFailed: 0 },
    };
  }

  // Validate
  const { validatedCategories, errors, warnings } = await validateCategories(data);

  // Bulk insert
  const { inserted, errors: insertErrors } = await bulkInsertCategories(validatedCategories, CategoryModel);

  return {
    success: errors.length === 0 && insertErrors.length === 0,
    totalRows: data.length,
    successfulInserts: inserted,
    errors: [...errors, ...insertErrors.map((e) => ({ rowNumber: 0, data: e.category, errors: [e.error] }))],
    warnings,
    summary: { totalAdded: inserted, totalFailed: insertErrors.length },
  };
}

/**
 * Generate sample Excel template for category import
 */
export function generateCategoryImportTemplate(): Buffer {
  const sampleData = [
    {
      name: "Finance",
      slug: "finance",
      code: "FIN",
      icon: "https://example.com/finance-icon.svg",
      image: "https://example.com/finance-banner.jpg",
      isActive: "true",
      sortOrder: 1,
    },
    {
      name: "Taxation",
      slug: "taxation",
      code: "TAX",
      icon: "https://example.com/tax-icon.svg",
      image: "https://example.com/tax-banner.jpg",
      isActive: "true",
      sortOrder: 2,
    },
    {
      name: "Compliance",
      slug: "compliance",
      code: "COM",
      icon: "https://example.com/compliance-icon.svg",
      image: "https://example.com/compliance-banner.jpg",
      isActive: "true",
      sortOrder: 3,
    },
    {
      name: "HR Services",
      slug: "hr-services",
      code: "HR",
      icon: "https://example.com/hr-icon.svg",
      image: "https://example.com/hr-banner.jpg",
      isActive: "true",
      sortOrder: 4,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
